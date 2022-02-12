import { Ticket } from '../ticket'

it('implements optimistic concurrency control', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 5,
		userId: '123',
	})
	await ticket.save()

	const firstTicket = await Ticket.findById(ticket.id)
	const secondTicket = await Ticket.findById(ticket.id)

	firstTicket?.set({ price: 10 })
	secondTicket?.set({ price: 15 })

	await firstTicket?.save()
	try {
		await secondTicket?.save()
	} catch (error) {
		return
	}

	throw new Error('Should not update second ticket')
})

it('increments version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: '123',
	})

	await ticket.save()
	expect(ticket.version).toBe(0)
	await ticket.save()
	expect(ticket.version).toBe(1)
	await ticket.save()
	expect(ticket.version).toBe(2)
})
