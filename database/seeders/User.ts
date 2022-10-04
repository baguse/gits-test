import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Hash from '@ioc:Adonis/Core/Hash'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run() {
    const password = await Hash.make('12345')
    await User.create({
      email: 'andreanto.bagus@gmail.com',
      name: 'Bagus Andreanto',
      password,
    })
  }
}
