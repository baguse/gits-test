import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Author from 'App/Models/Author'

export default class AuthorsController {
  public async getAll(ctx: HttpContextContract) {
    const { request } = ctx

    const page = request.input('page', 1)
    const perPage = request.input('per_page', 0)
    const search = request.input('search', '')

    const query = Author.query().preload('books', (bookQuery) => {
      bookQuery.select(['id', 'title', 'description', 'total_page', 'genre'])
    })

    if (search) {
      query.orWhereLike('name', `%${search}%`)
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

    const newAuthorSchema = schema.create({
      name: schema.string(),
    })

    try {
      const data = await request.validate({
        schema: newAuthorSchema,
      })

      const result = await Author.create(data)

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

    const data = await Author.query()
      .preload('books', (bookQuery) => {
        bookQuery.select(['id', 'title', 'description', 'total_page', 'genre'])
      })
      .where('id', id)
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

    const data = await Author.query().where('id', id).first()

    if (!data)
      return response.notFound({
        success: false,
        message: 'Data not found',
      })

    const newAuthorSchema = schema.create({
      name: schema.string.optional(),
    })

    const payload = await request.validate({
      schema: newAuthorSchema,
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

    const data = await Author.query().where('id', id).first()

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
