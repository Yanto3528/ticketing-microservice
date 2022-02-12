import { Publisher, Subjects, OrderCancelledEvent } from '@ylticket/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled
}
