import { Publisher, Subjects, TicketUpdatedEvent } from '@ylticket/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated
}
