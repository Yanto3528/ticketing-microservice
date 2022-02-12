import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import { body } from 'express-validator'
import {
	BadRequestError,
	NotFoundError,
	OrderStatus,
	requireAuth,
	validateRequest,
} from '@ylticket/common'
import { Ticket } from '../models/ticket'
import { Order } from '../models/order'
import { OrderCreatedPublisher } from '../events/publisher/order-created'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60

const validateCreateOrder = [
	body('ticketId', 'Ticket id must be provided')
		.not()
		.isEmpty()
		.custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
	validateRequest,
]

router.post(
	'/api/orders',
	requireAuth,
	validateCreateOrder,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body

		const ticket = await Ticket.findById(ticketId)
		if (!ticket) {
			throw new NotFoundError()
		}

		// Find whether this ticket has been reserved or not
		const isReserved = await ticket.isReserved()
		if (isReserved) {
			throw new BadRequestError('Ticket is reserved')
		}

		const expiration = new Date()
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)

		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket,
		})
		await order.save()

		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			userId: order.userId,
			status: order.status,
			expiresAt: order.expiresAt.toISOString(),
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		})

		res.status(201).json(order)
	}
)

export { router as createOrderRouter }
