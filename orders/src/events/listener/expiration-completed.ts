import { Subjects, Listener, ExpirationCompletedEvent, OrderStatus } from '@ylticket/common'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../publisher/order-cancelled'
import { natsWrapper } from '../../nats-wrapper'

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
	readonly subject = Subjects.ExpirationCompleted
	queueGroupName = queueGroupName
	async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
		const order = await Order.findById(data.orderId).populate('ticket')

		if (!order) {
			throw new Error('Order not found')
		}

		if (order.status === OrderStatus.Completed) {
			return msg.ack()
		}

		order.set({
			status: OrderStatus.Cancelled,
		})
		await order.save()
		await new OrderCancelledPublisher(natsWrapper.client).publish({
			id: order.id,
			version: order.version,
			ticket: {
				id: order.ticket.id,
			},
		})

		msg.ack()
	}
}
