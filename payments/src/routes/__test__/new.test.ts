import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order } from '../../models/order'
import { OrderStatus } from '@ylticket/common'
import { stripe } from '../../stripe'
import { Payment } from '../../models/payment'

jest.mock('../../stripe')

it('returns 404 status code when order is not found', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdkl',
			orderId: new mongoose.Types.ObjectId().toHexString(),
		})
		.expect(404)
})

it('returns 401 if purchased tickets does not belong to the user', async () => {
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		version: 0,
		price: 20,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({
			token: 'asdkl',
			orderId: order.id,
		})
		.expect(401)
})

it('returns 400 if trying to purchase ticket that are cancelled', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString()
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		status: OrderStatus.Cancelled,
		version: 0,
		price: 20,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'asdkl',
			orderId: order.id,
		})
		.expect(400)
})

it('returns 200 for valid inputs', async () => {
	const userId = new mongoose.Types.ObjectId().toHexString()
	const price = Math.floor(Math.random() * 10000)
	const order = Order.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		userId,
		status: OrderStatus.Created,
		version: 0,
		price,
	})
	await order.save()

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({
			token: 'tok_visa',
			orderId: order.id,
		})
		.expect(201)

	const createMock = stripe.charges.create as jest.Mock
	const chargeOptions = createMock.mock.calls[0][0]

	expect(chargeOptions.currency).toBe('usd')
	expect(chargeOptions.amount).toBe(order.price * 100)
	expect(chargeOptions.source).toBe('tok_visa')

	const charge = await stripe.charges.retrieve('asdf')
	const payment = await Payment.findOne({
		orderId: order.id,
		stripeId: charge.id,
	})

	expect(payment).not.toBeNull()
})
