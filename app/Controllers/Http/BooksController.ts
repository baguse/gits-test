import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Book from 'App/Models/Book'

export default class BooksController {
  public async getAll(ctx: HttpContextContract) {
    const { request } = ctx

    const page = request.input('page', 1)
    const perPage = request.input('per_page', 0)
    const authorId = request.input('author_id', 0)
    const publisherId = request.input('publisher_id', 0)
    const search = request.input('search', '')

    const query = Book.query()
      .preload('author', (authorQuery) => {
        authorQuery.select(['id', 'name'])
      })
      .preload('publisher', (publisherQuery) => {
        publisherQuery.select(['id', 'name'])
      })

    if (search) {
      query.orWhereLike('title', `%${search}%`)
      query.orWhereLike('description', `%${search}%`)
    }

    if (authorId) {
      query.where('author_id', authorId)
    }

    if (publisherId) {
      query.where('publisher_id', publisherId)
    }

    const queryCount = query.clone()
    const count = Number((await queryCount.clone().count('id', 'count').first())?.$extras.count)

    let totalPage = 0
    if (page && perPage) {
      query.limit(Number(perPage))
      query.offset((Number(page) - 1) * perPage)
      totalPage = Math.ceil(count / perPage)
    }

    const data = await query

    return {
      success: true,
      data,
      meta: {
        total_data: count,
        total_page: totalPage,
      },
    }
  }

  public async create(ctx: HttpContextContract) {
    const { request, response } = ctx

    const newBookSchema = schema.create({
      title: schema.string(),
      description: schema.string(),
      total_page: schema.number([rules.unsigned()]),
      genre: schema.string.optional(),
      author_id: schema.number([rules.unsigned()]),
      publisher_id: schema.number([rules.unsigned()]),
    })

    try {
      const data = await request.validate({
        schema: newBookSchema,
      })

      const result = await Book.create(data)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      return response.badRequest({
        success: false,
        message: error.message,
        meta: error?.messages,
      })
    }
  }

  public async getOne(ctx: HttpContextContract) {
    const { request, response } = ctx

    const id = request.param('id')

    const data = await Book.query()
      .where('id', id)
      .preload('author', (authorQuery) => {
        authorQuery.select(['id', 'name'])
      })
      .preload('publisher', (publisherQuery) => {
        publisherQuery.select(['id', 'name'])
      })
      .first()

    if (!data)
      return response.notFound({
        success: false,
        message: 'Data not found',
      })

    return {
      success: true,
      data,
    }
  }

  public async update(ctx: HttpContextContract) {
    const { request, response } = ctx

    const id = request.param('id')

    const data = await Book.query().where('id', id).first()

    if (!data)
      return response.notFound({
        success: false,
        message: 'Data not found',
      })

    const newBookSchema = schema.create({
      title: schema.string.optional(),
      description: schema.string.optional(),
      total_page: schema.number.optional([rules.unsigned()]),
      genre: schema.string.optional(),
    })

    const payload = await request.validate({
      schema: newBookSchema,
    })

    data.merge(payload)

    await data.save()

    return {
      success: true,
      data,
    }
  }

  public async delete(ctx: HttpContextContract) {
    const { request, response } = ctx

    const id = request.param('id')

    const data = await Book.query().where('id', id).first()

    if (!data)
      return response.notFound({
        success: false,
        message: 'Data not found',
      })

    await data.delete()

    return {
      success: true,
    }
  }
}
