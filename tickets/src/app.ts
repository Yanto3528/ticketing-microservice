import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'
import dotenv from 'dotenv'
import { errorHandler, NotFoundError, currentUser } from '@ylticket/common'

import { createTicketRouter } from './routes/new'
import { showTicketRouter } from './routes/show'
import { listingTicketRouter } from './routes/listing'
import { updateTicketRouter } from './routes/update'

dotenv.config()

const app = express()
app.set('trust proxy', true)
app.use(express.json())
app.use(
	cookieSession({
		signed: false,
		secure: process.env.NODE_ENV !== 'test',
	})
)
app.use(currentUser)

app.use(createTicketRouter)
app.use(showTicketRouter)
app.use(listingTicketRouter)
app.use(updateTicketRouter)

app.all('*', async () => {
	throw new NotFoundError()
})

app.use(errorHandler)

export { app }
