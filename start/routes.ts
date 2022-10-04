/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/auths/login', 'AuthsController.login')

// Authors
Route.get('/authors', 'AuthorsController.getAll').middleware('auth:api')
Route.post('/authors', 'AuthorsController.create').middleware('auth:api')
Route.get('/authors/:id', 'AuthorsController.getOne').middleware('auth:api')
Route.patch('/authors/:id', 'AuthorsController.update').middleware('auth:api')
Route.delete('/authors/:id', 'AuthorsController.delete').middleware('auth:api')

// Publishers
Route.get('/publishers', 'PublishersController.getAll').middleware('auth:api')
Route.post('/publishers', 'PublishersController.create').middleware('auth:api')
Route.get('/publishers/:id', 'PublishersController.getOne').middleware('auth:api')
Route.patch('/publishers/:id', 'PublishersController.update').middleware('auth:api')
Route.delete('/publishers/:id', 'PublishersController.delete').middleware('auth:api')

// Books
Route.get('/books', 'BooksController.getAll').middleware('auth:api')
Route.post('/books', 'BooksController.create').middleware('auth:api')
Route.get('/books/:id', 'BooksController.getOne').middleware('auth:api')
Route.patch('/books/:id', 'BooksController.update').middleware('auth:api')
Route.delete('/books/:id', 'BooksController.delete').middleware('auth:api')
