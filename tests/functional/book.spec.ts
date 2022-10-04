import { test } from '@japa/runner'
import Book from 'App/Models/Book'
import User from 'App/Models/User'
import Author from 'App/Models/Author'
import Publisher from 'App/Models/Publisher'

import { authors, books, publishers } from './data'

test.group('Books test', (group) => {
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

  test('Get All Book', async ({ client, assert }) => {
    const response = await client
      .get('/books')
      .guard('api')
      .loginAs(user as User)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, books.length)
    assert.equal(body?.data.length, books.length)
  })

  test('Get All Book w/ pagination', async ({ client, assert }) => {
    const response = await client.get('/books?page=1&per_page=2').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, books.length)
    assert.equal(body?.data.length, 2)
  })

  test('Get All Book pagination w/ empty page data', async ({ client, assert }) => {
    const response = await client.get('/books?page=99&per_page=1').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.meta?.total_data, books.length)
    assert.equal(body?.data.length, 0)
  })

  test('Get one w/ not exists', async ({ client }) => {
    const response = await client.get('/books/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Get one w/ exists id 3', async ({ client, assert }) => {
    const response = await client.get('/books/3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.title, books[2].title)
  })

  test('Update w/ not exists', async ({ client }) => {
    const response = await client.patch('/books/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Update one w/ exists id 3', async ({ client, assert }) => {
    const response = await client.patch('/books/3').guard('api').loginAs(user).json({
      title: 'Kungfu Panda',
    })

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()

    assert.equal(body?.data.title, 'Kungfu Panda')

    const physicalData = await Book.find(3)

    assert.equal(physicalData?.title, 'Kungfu Panda')
  })

  test('Delete w/ not exists', async ({ client }) => {
    const response = await client.delete('/books/99').guard('api').loginAs(user)

    response.assertStatus(404)
    response.assertBodyContains({ success: false })
  })

  test('Delete one w/ exists id 3', async ({ client, assert }) => {
    const response = await client.delete('/books/3').guard('api').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const physicalData = await Book.find(3)

    assert.isNull(physicalData)
  })
})
