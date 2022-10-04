import { test } from '@japa/runner'
import Book from 'App/Models/Book'
import User from 'App/Models/User'
import Author from 'App/Models/Author'
import Publisher from 'App/Models/Publisher'

import { authors, books, publishers } from './data'

test.group('Authors test', (group) => {
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

  test('Get All authors', async ({ client, assert }) => {
    const response = await client
      .get('/authors')
      .guard('api')
      .loginAs(user as User)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, authors.length)
    assert.equal(body?.data.length, authors.length)
  })

  test('Get All Authors w/ pagination', async ({ client, assert }) => {
    const response = await client.get('/authors?page=1&per_page=3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, authors.length)
    assert.equal(body?.data.length, 3)
  })

  test('Get All Author pagination w/ empty page data', async ({ client, assert }) => {
    const response = await client.get('/authors?page=99&per_page=1').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, authors.length)
    assert.equal(body?.data.length, 0)
  })

  test('Get one w/ not exists', async ({ client }) => {
    const response = await client.get('/authors/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Get one w/ exists id 4', async ({ client, assert }) => {
    const response = await client.get('/authors/4').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, authors[3].name)
  })

  test('Update w/ not exists', async ({ client }) => {
    const response = await client.patch('/authors/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Update one w/ exists id 3', async ({ client, assert }) => {
    const newName = 'Tobirama Senju'
    const response = await client.patch('/authors/3').guard('api').loginAs(user).json({
      name: newName,
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.name, newName)

    const physicalData = await Author.find(3)

    assert.equal(physicalData?.name, newName)
  })

  test('Delete w/ not exists', async ({ client }) => {
    const response = await client.delete('/authors/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Delete one w/ exists id 3', async ({ client, assert }) => {
    const response = await client.delete('/authors/3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const physicalData = await Author.find(3)

    assert.isNull(physicalData)
  })
})
