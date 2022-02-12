import mongoose from 'mongoose'
import { ExpirationCompletedEvent, OrderStatus } from '@ylticket/common'
import { ExpirationCompletedListener } from '../expiration-completed'
import { Ticket } from '../../../models/ticket'
import { Order } from '../../../models/order'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
	const listener = new ExpirationCompletedListener(natsWrapper.client)
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()

	const order = Order.build({
		status: OrderStatus.Created,
		userId: 'existing-user',
		expiresAt: new Date(),
		ticket,
	})
	await order.save()

	const data: ExpirationCompletedEvent['data'] = {
		orderId: order.id,
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, msg, ticket, order }
}

it('updates order status to cancelled', async () => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	const updatedTicket = await Order.findById(order.id)

	expect(updatedTicket!.status).toBe(OrderStatus.Cancelled)
})

it('publishes order cancelled events', async () => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	const publishMock = natsWrapper.client.publish as jest.Mock
	const eventData = JSON.parse(publishMock.mock.calls[0][1])

	expect(publishMock).toHaveBeenCalled()
	expect(eventData.id).toBe(order.id)
})

it('acks the message', async () => {
	const { listener, data, msg, ticket, order } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})
