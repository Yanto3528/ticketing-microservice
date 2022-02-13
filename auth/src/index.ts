import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
	console.log('Starting up....')
	if (!process.env.JWT_KEY) {
		throw new Error('JWT_KEY must be defined')
	}

	if (!process.env.MONGO_URI) {
		throw new Error('MONGO_URI must be defined')
	}

	if (!process.env.MONGO_DATABASE_NAME) {
		throw new Error('MONGO_DATABASE_NAME must be defined')
	}

	try {
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
