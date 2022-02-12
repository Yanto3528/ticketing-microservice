import mongoose from 'mongoose'
import { TicketUpdatedEvent } from '@ylticket/common'
import { TicketUpdatedListener } from '../ticket-updated'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'

const setup = async () => {
	const listener = new TicketUpdatedListener(natsWrapper.client)

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	})
	await ticket.save()

	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: 'new concert',
		price: 100,
		userId: 'asdfjl;kj',
	}

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	}

	return { listener, data, ticket, msg }
}

it('find, update and saves a ticket', async () => {
	const { listener, data, ticket, msg } = await setup()

	await listener.onMessage(data, msg)

	const updatedTicket = await Ticket.findById(ticket.id)

	expect(updatedTicket).toBeDefined()
	expect(updatedTicket!.title).toBe(data.title)
	expect(updatedTicket!.price).toBe(data.price)
	expect(updatedTicket!.version).toBe(data.version)
})

it('acks the message', async () => {
	const { listener, data, msg } = await setup()

	await listener.onMessage(data, msg)

	expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has skipped version number', async () => {
	const { msg, data, listener } = await setup()

	data.version = 10

	try {
		await listener.onMessage(data, msg)
	} catch (error) {}

	expect(msg.ack).not.toHaveBeenCalled()
})
