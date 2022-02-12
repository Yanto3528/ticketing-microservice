import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { requireAuth, validateRequest } from '@ylticket/common'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const validateCreatePost = [
	body('title', 'Title must not be empty').not().isEmpty(),
	body('price', 'Price must be greater than 0').isFloat({ gt: 0 }),
]

router.post(
	'/api/tickets',
	requireAuth,
	validateCreatePost,
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body

		const ticket = Ticket.build({
			title,
			price,
			userId: req.currentUser!.id,
		})
		await ticket.save()
		new TicketCreatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		})

		res.status(201).json(ticket)
	}
)

export { router as createTicketRouter }
