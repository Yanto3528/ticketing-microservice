import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@ylticket/common'
import { OrderCreatedListener } from '../order-created'
import { natsWrapper } from '../../../nats-wrapper'
import { Order } from '../../../models/order'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiresAt: 'expires',
		ticket: {
			id: '123',
			price: 20,
		},
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, msg }
}

it('replicates order data', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	const order = await Order.findById(data.id)
	expect(order!.price).toBe(data.ticket.price)
})

it('replicates order data', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})
