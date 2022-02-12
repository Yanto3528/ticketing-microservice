import request from 'supertest'
import mongoose from 'mongoose'

import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('returns 404 if ticket is not found', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(404)
})

it('returns 401 if user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString()
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(401)
})
it('returns 401 if user does not own the ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({
			title: 'updated title',
			price: 1000,
		})
		.expect(401)
})

it('returns 400 with invalid title or price', async () => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: '',
			price: 20,
		})
		.expect(400)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: -10,
		})
		.expect(400)
})
it('returns 200 with valid parameters', async () => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(201)

	const updatedResponse = await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100,
		})
		.expect(200)

	expect(updatedResponse.body.title).toBe('updated title')
	expect(updatedResponse.body.price).toBe(100)

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send()
		.expect(200)

	expect(ticketResponse.body.title).toBe('updated title')
	expect(ticketResponse.body.price).toBe(100)
})

it('should publish an event after updating a ticket', async () => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(201)

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100,
		})
		.expect(200)

	expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('reject updates if ticket is reserved', async () => {
	const cookie = global.signin()
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 20,
		})
		.expect(201)

	const ticket = await Ticket.findById(response.body.id)
	ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
	await ticket!.save()

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({
			title: 'updated title',
			price: 100,
		})
		.expect(400)
})
