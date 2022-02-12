import request from 'supertest'
import { app } from '../../app'

it('return 201 status code on successfull signin', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(201)

	await request(app)
		.post('/api/users/signin')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(200)
})

it('return 400 status code with wrong email', async () => {
	return request(app)
		.post('/api/users/signin')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(400)
})

it('return 400 status code with wrong password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(201)

	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'p' })
		.expect(400)
})
