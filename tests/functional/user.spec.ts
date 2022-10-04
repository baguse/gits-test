import { test } from '@japa/runner'

test('Login user failed', async ({ client }) => {
  const response = await client.post('/auths/login').json({
    email: 'andreanto.bagus@gmail.com',
    password: 'wrong password',
  })

  response.assertStatus(401)
  response.assertBodyContains({ success: false, message: 'Invalid Credentials' })
})

test('Login user success', async ({ client }) => {
  const response = await client.post('/auths/login').json({
    email: 'andreanto.bagus@gmail.com',
    password: '12345',
  })

  response.assertStatus(200)
  response.assertBodyContains({ success: true })
})
