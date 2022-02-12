import { Subjects } from './subjects'

export interface TickerCreatedEvent {
	subject: Subjects.TicketCreated
	data: {
		id: string
		title: string
		price: number
	}
}
