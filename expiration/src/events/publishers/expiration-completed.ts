import { Subjects, Publisher, ExpirationCompletedEvent } from '@ylticket/common'

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
	readonly subject = Subjects.ExpirationCompleted
}
