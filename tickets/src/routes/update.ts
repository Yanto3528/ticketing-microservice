import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requireAuth,
	validateRequest,
	NotAuthorizedError,
	NotFoundError,
	BadRequestError,
} from '@ylticket/common'

import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated'
import { natsWrapper } from '../nats-wrapper'
import { Ticket } from '../models/ticket'

const router = express.Router()

const validateUpdateTicket = [
	body('title', 'Title is required').not().isEmpty(),
	body('price', 'Price must be greater than 0').isFloat({ gt: 0 }),
]

router.put(
	'/api/tickets/:id',
	requireAuth,
	validateUpdateTicket,
	validateRequest,
	async (req: Request, res: Response) => {
		const ticket = await Ticket.findById(req.params.id)

		if (!ticket) {
			throw new NotFoundError()
		}

		if (ticket.orderId) {
			throw new BadRequestError('Cannot edit a reserved ticket')
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		ticket.set({
			title: req.body.title,
			price: req.body.price,
		})
		await ticket.save()
		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		})

		res.json(ticket)
	}
)

export { router as updateTicketRouter }
