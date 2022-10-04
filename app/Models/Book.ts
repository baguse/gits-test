import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Author from 'App/Models/Author'
import Publisher from 'App/Models/Publisher'

export default class Book extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public title: string

  @column()
  public description: string

  @column()
  public total_page: number

  @column()
  public genre: string

  @column()
  public author_id: number

  @column()
  public publisher_id: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  // relations
  @belongsTo(() => Author, {
    foreignKey: 'author_id',
  })
  public author: BelongsTo<typeof Author>

  @belongsTo(() => Publisher, {
    foreignKey: 'publisher_id',
  })
  public publisher: BelongsTo<typeof Publisher>
}
