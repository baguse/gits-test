import Hash from '@ioc:Adonis/Core/Hash'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class AuthsController {
  public async login(ctx: HttpContextContract) {
    const { auth, request, response } = ctx
    const email = request.input('email')
    const password = request.input('password')

    const user = await User.query().where('email', email).first()

    if (!user) {
      return response.unauthorized({
        success: false,
        message: 'Invalid Credentials',
      })
    }

    const isPasswordMatch = await Hash.verify(user.password, password)

    if (!isPasswordMatch) {
      return response.unauthorized({
        success: false,
        message: 'Invalid Credentials',
      })
    }

    const authData = await auth.use('api').generate(user)

    return {
      success: true,
      data: {
        token: authData.token,
      },
    }
  }
}
