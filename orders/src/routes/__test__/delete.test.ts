import request from 'supertest'
import mongoose from 'mongoose'
import { OrderStatus } from '@ylticket/common'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { Order } from '../../models/order'
import { natsWrapper } from '../../nats-wrapper'

it('marks an order as cancelled', async () => {
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()

	const user = global.signin()
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({ ticketId: ticket.id })
		.expect(201)

	await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).expect(204)

	expect(natsWrapper.client.publish).toHaveBeenCalled()

	const updatedOrder = await Order.findById(order.id)

	expect(updatedOrder?.status).toBe(OrderStatus.Cancelled)
})
