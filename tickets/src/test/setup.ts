import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import jwt from 'jsonwebtoken'

import { app } from '../app'

declare global {
	function signin(): string[]
}

jest.mock('../nats-wrapper')

let mongo: any
beforeAll(async () => {
	process.env.JWT_KEY = 'asdflkj'
	mongo = await MongoMemoryServer.create()
	const mongoUri = mongo.getUri()

	await mongoose.connect(mongoUri)
})

beforeEach(async () => {
	jest.clearAllMocks()
	const collections = await mongoose.connection.db.collections()

	for (let collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	await mongo.stop()
	await mongoose.connection.close()
})

global.signin = () => {
	const payload = {
		id: new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com',
	}

	const token = jwt.sign(payload, process.env.JWT_KEY!)

	const session = JSON.stringify({ jwt: token })
	const sessionString = Buffer.from(session).toString('base64')

	return [`session=${sessionString}`]
}
