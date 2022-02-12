import request from 'supertest'
import { app } from '../../app'

it('return 201 status code on successfull signup', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(201)
})

it('return 400 status code with invalid email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test', password: 'password' })
		.expect(400)
})

it('return 400 status code with invalid password', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'p' })
		.expect(400)
})

it('return 400 status code with missing email and password', async () => {
	await request(app).post('/api/users/signup').send({ email: 'test@test.com' }).expect(400)

	await request(app).post('/api/users/signup').send({ password: 'password' }).expect(400)
})

it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(201)
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(400)
})

it('sets a cookie after successfull signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({ email: 'test@test.com', password: 'password' })
		.expect(201)

	expect(response.get('Set-Cookie')).toBeDefined()
})
