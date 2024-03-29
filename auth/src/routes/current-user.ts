import express from 'express'
import jwt from 'jsonwebtoken'

import { currentUser } from '@ylticket/common'

const router = express.Router()

router.get('/api/users/currentuser', currentUser, (req, res) => {
	res.json({ currentUser: req.currentUser || null })
})

export { router as currentUserRouter }
