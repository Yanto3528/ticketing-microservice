import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { TicketCreatedListener } from './events/listener/ticket-created'
import { TicketUpdatedListener } from './events/listener/ticket-updated'
import { ExpirationCompletedListener } from './events/listener/expiration-completed'
import { PaymentCreatedListener } from './events/listener/payment-created'

const start = async () => {
	console.log('Starting..')
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined')
	}
	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined')
	}
	if (!process.env.MONGO_DATABASE_NAME) {
		throw new Error('MONGO_DATABASE_NAME must be defined')
	}
	if (!process.env.NATS_CLIENT_ID) {
		throw new Error('NATS_CLIENT_ID must be defined')
	}
	if (!process.env.NATS_CLUSTER_ID) {
		throw new Error('NATS_CLUSTER_ID must be defined')
	}
	if (!process.env.NATS_URL) {
		throw new Error('NATS_URL must be defined')
	}

	try {
		await natsWrapper.connect(
			process.env.NATS_CLUSTER_ID,
			process.env.NATS_CLIENT_ID,
			process.env.NATS_URL
		)
		natsWrapper.client.on('close', () => {
			console.log('Nats connection closed')
			process.exit()
		})
		process.on('SIGTERM', () => natsWrapper.client.close())
		process.on('SIGINT', () => natsWrapper.client.close())

		new TicketCreatedListener(natsWrapper.client).listen()
		new TicketUpdatedListener(natsWrapper.client).listen()
		new ExpirationCompletedListener(natsWrapper.client).listen()
		new PaymentCreatedListener(natsWrapper.client).listen()

		await mongoose.connect(
			`${process.env.MONGO_URI}/${process.env.MONGO_DATABASE_NAME}?retryWrites=true&w=majority`
		)
		console.log('DB connected')
	} catch (error) {
		console.error(error)
	}
	app.listen(3000, () => console.log('Listening on port 3000!!!'))
}

start()
