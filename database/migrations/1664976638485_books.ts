import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title', 255).notNullable()
      table.string('description', 512).notNullable()
      table.string('genre', 25)
      table.integer('total_page').unsigned().notNullable()
      table.integer('author_id').unsigned().references('id').inTable('authors').onDelete('CASCADE')
      table
        .integer('publisher_id')
        .unsigned()
        .references('id')
        .inTable('publishers')
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
