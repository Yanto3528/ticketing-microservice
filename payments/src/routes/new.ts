import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
	requireAuth,
	validateRequest,
	BadRequestError,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
} from '@ylticket/common'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

const validateCreateCharge = [
	body('token', 'Invalid token').not().isEmpty(),
	body('orderId', 'Please provide orderId').not().isEmpty(),
	validateRequest,
]

router.post(
	'/api/payments',
	requireAuth,
	validateCreateCharge,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body

		const order = await Order.findById(orderId)
		if (!order) {
			throw new NotFoundError()
		}

		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError()
		}

		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for a cancelled order')
		}

		const charge = await stripe.charges.create({
			currency: 'usd',
			amount: order.price * 100,
			source: token,
		})

		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		})
		await payment.save()

		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		})

		res.status(201).json({ success: true })
	}
)

export { router as createChargeRouter }
