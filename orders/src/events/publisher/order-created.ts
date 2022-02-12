import { Publisher, Subjects, OrderCreatedEvent } from '@ylticket/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated
}
