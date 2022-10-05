import { test } from '@japa/runner'
import Book from 'App/Models/Book'
import User from 'App/Models/User'
import Author from 'App/Models/Author'
import Publisher from 'App/Models/Publisher'

import { authors, books, publishers } from './data'

test.group('Publishers test', (group) => {
  let user: User
  group.setup(async () => {
    await Author.createMany(authors)
    await Publisher.createMany(publishers)
    await Book.createMany(books)
    user = (await User.find(1)) as User
  })

  group.teardown(async () => {
    await Book.truncate(true)
    await Author.truncate(true)
    await Publisher.truncate(true)
  })

  test('Get All publishers', async ({ client, assert }) => {
    const response = await client
      .get('/publishers')
      .guard('api')
      .loginAs(user as User)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, publishers.length)
    assert.equal(body?.data.length, publishers.length)
  })

  test('Get All Publishers w/ pagination', async ({ client, assert }) => {
    const response = await client.get('/publishers?page=1&per_page=2').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, publishers.length)
    assert.equal(body?.data.length, 2)
  })

  test('Get All Publishers pagination w/ empty page data', async ({ client, assert }) => {
    const response = await client.get('/publishers?page=99&per_page=1').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, publishers.length)
    assert.equal(body?.data.length, 0)
  })

  test('Get one w/ not exists', async ({ client }) => {
    const response = await client.get('/publishers/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Get one w/ exists id 2', async ({ client, assert }) => {
    const response = await client.get('/publishers/2').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, publishers[1].name)
  })

  test('Get one w/ exists id 1 and check books relations', async ({ client, assert }) => {
    const response = await client.get('/publishers/1').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, publishers[0].name)

    const currentBooks = books.filter((x) => x.publisher_id === 1)

    assert.equal(body?.data.books.length, currentBooks.length)
  })

  test('Get one w/ exists id 3 and check books relations', async ({ client, assert }) => {
    const response = await client.get('/publishers/3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, publishers[2].name)

    const currentBooks = books.filter((x) => x.publisher_id === 3)

    assert.equal(body?.data.books.length, currentBooks.length)
  })

  test('Update w/ not exists', async ({ client }) => {
    const response = await client.patch('/publishers/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Update one w/ exists id 3', async ({ client, assert }) => {
    const newName = 'Percetakan Fajar'
    const response = await client.patch('/publishers/3').guard('api').loginAs(user).json({
      name: newName,
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, newName)

    const physicalData = await Publisher.find(3)

    assert.equal(physicalData?.name, newName)
  })

  test('Delete w/ not exists', async ({ client }) => {
    const response = await client.delete('/publishers/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Delete one w/ exists id 3', async ({ client, assert }) => {
    const response = await client.delete('/publishers/3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const physicalData = await Publisher.find(3)

    assert.isNull(physicalData)
  })
})
