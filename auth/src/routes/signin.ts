import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { BadRequestError, validateRequest } from '@ylticket/common'
import { User } from '../models/user'
import { Password } from '../services/password'

const router = express.Router()

const validateSignin = [
	body('email', 'Email must be valid').isEmail(),
	body('password', 'Password must be supplied').trim().notEmpty(),
]

router.post(
	'/api/users/signin',
	validateSignin,
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body

		const user = await User.findOne({ email })
		if (!user) {
			throw new BadRequestError('Invalid credentials')
		}

		const isPasswordMatch = await Password.compare(user.password, password)
		if (!isPasswordMatch) {
			throw new BadRequestError('Invalid credentials')
		}

		const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!)

		req.session = {
			jwt: token,
		}

		res.status(200).json(user)
	}
)

export { router as signinRouter }
