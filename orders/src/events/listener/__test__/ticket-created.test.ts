import mongoose from 'mongoose'
import { TicketCreatedEvent } from '@ylticket/common'
import { TicketCreatedListener } from '../ticket-created'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
	const listener = new TicketCreatedListener(natsWrapper.client)

	const data: TicketCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		title: 'concert',
		price: 20,
		userId: new mongoose.Types.ObjectId().toHexString(),
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, msg }
}

it('creates and saves a ticket', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	const ticket = await Ticket.findById(data.id)

	expect(ticket).toBeDefined()
	expect(ticket!.title).toBe(data.title)
	expect(ticket!.price).toBe(data.price)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})
