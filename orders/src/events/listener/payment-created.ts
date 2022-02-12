import { Message } from 'node-nats-streaming'
import { Listener, Subjects, PaymentCreatedEvent, OrderStatus } from '@ylticket/common'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated
	queueGroupName = queueGroupName
	async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId)
		if (!order) {
			throw new Error('Order not found')
		}

		order.set({
			status: OrderStatus.Completed,
		})
		await order.save()

		// Usually needs to publish an order:updated events,
		// but for the sake of following the course, no need to do that

		msg.ack()
	}
}
