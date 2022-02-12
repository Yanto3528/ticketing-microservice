import { Publisher } from './base-publisher'
import { Subjects } from './subjects'
import { TickerCreatedEvent } from './ticket-created-event'

export class TicketCreatedPublisher extends Publisher<TickerCreatedEvent> {
	readonly subject = Subjects.TicketCreated
}
