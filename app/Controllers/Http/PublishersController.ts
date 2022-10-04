import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import Publisher from 'App/Models/Publisher'

export default class PublishersController {
  public async getAll(ctx: HttpContextContract) {
    const { request } = ctx

    const page = request.input('page', 1)
    const perPage = request.input('per_page', 0)
    const search = request.input('search', '')

    const query = Publisher.query()

    if (search) {
      query.andWhereLike('name', `%${search}%`)
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

    const newPublisherSchema = schema.create({
      name: schema.string(),
    })

    try {
      const data = await request.validate({
        schema: newPublisherSchema,
      })

      const result = await Publisher.create(data)

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

    const data = await Publisher.query().where('id', id).first()

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

    const data = await Publisher.query().where('id', id).first()

    if (!data)
      return response.notFound({
        success: false,
        message: 'Data not found',
      })

    const newPublisherSchema = schema.create({
      name: schema.string.optional(),
    })

    const payload = await request.validate({
      schema: newPublisherSchema,
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

    const data = await Publisher.query().where('id', id).first()

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
