import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { BadRequestError, validateRequest } from '@ylticket/common'
import { User } from '../models/user'

const router = express.Router()

const validateSignup = [
	body('email', 'Email must be valid').isEmail(),
	body('password', 'Password must be between 4 and 20 characters')
		.trim()
		.isLength({ min: 4, max: 20 }),
]

router.post(
	'/api/users/signup',
	validateSignup,
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body

		const existingUser = await User.findOne({ email })
		if (existingUser) {
			throw new BadRequestError('Email in use')
		}

		const user = User.build({ email, password })
		await user.save()

		const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!)

		req.session = {
			jwt: token,
		}

		res.status(201).json(user)
	}
)

export { router as signupRouter }
