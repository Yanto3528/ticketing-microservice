import request from 'supertest'

import { Ticket } from '../../models/ticket'
import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'

it('should have a handler listening for /api/tickets for post request', async () => {
	const response = await request(app).post('/api/tickets').send({})

	expect(response.statusCode).not.toBe(404)
})

it('can only be accessed if the user is signed in', async () => {
	await request(app).post('/api/tickets').send({}).expect(401)
})

it('return status other than 401 if user is signed in', async () => {
	const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({})

	expect(response.status).not.toBe(401)
})

it('returns an error if title is invalid', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: '',
			price: 10,
		})
		.expect(400)

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			price: 10,
		})
		.expect(400)
})
it('returns an error if price is invalid', async () => {
	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'valid title',
			price: -10,
		})
		.expect(400)

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'valid title',
		})
		.expect(400)
})
it('create new ticket with valid inputs', async () => {
	let tickets = await Ticket.find({})
	expect(tickets.length).toBe(0)

	const title = 'valid-title'
	const price = 20

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201)

	tickets = await Ticket.find({})
	expect(tickets.length).toBe(1)
	expect(tickets[0].title).toBe(title)
	expect(tickets[0].price).toBe(price)
})

it('should publish an event after creating ticket', async () => {
	const title = 'valid-title'
	const price = 20

	await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title,
			price,
		})
		.expect(201)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})
