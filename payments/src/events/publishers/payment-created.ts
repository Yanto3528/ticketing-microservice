import { Subjects, PaymentCreatedEvent, Publisher } from '@ylticket/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated
}
