import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { TickerCreatedEvent } from './ticket-created-event'
import { Subjects } from './subjects'

export class TicketCreatedListener extends Listener<TickerCreatedEvent> {
	readonly subject = Subjects.TicketCreated
	queueGroupName = 'payments-service'

	onMessage(data: TickerCreatedEvent['data'], msg: Message) {
		console.log('event data!', data)

		msg.ack()
	}
}
