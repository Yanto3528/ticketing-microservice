import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { OrderCreatedEvent, OrderStatus } from '@ylticket/common'
import { OrderCreatedListener } from '../order-created'
import { natsWrapper } from '../../../nats-wrapper'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: 'existing user',
	})
	await ticket.save()

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'existing user',
		expiresAt: 'expires',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, msg, ticket }
}

it('sets orderId to ticket', async () => {
	const { listener, msg, data, ticket } = await setup()

	await listener.onMessage(data, msg)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket!.orderId).toBe(data.id)
})

it('acks the message', async () => {
	const { listener, msg, data } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})

it('publishes an event', async () => {
	const { listener, msg, data, ticket } = await setup()

	await listener.onMessage(data, msg)

	const publishMock = natsWrapper.client.publish as jest.Mock
	const updatedTicketData = JSON.parse(publishMock.mock.calls[0][1])

	expect(updatedTicketData.orderId).toBe(data.id)
	expect(updatedTicketData.id).toBe(ticket.id)
})
