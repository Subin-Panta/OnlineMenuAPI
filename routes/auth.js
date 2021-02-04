const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const authController = require('../controllers/auth')
router.post(
	'/',
	[
		body('email')
			.trim()
			.isEmail()
			.normalizeEmail()
			.withMessage('Enter Valid Email'),
		body('password')
			.trim()
			.not()
			.isEmpty()
			.isLength({ min: 6 })
			.withMessage('6 chars minimum')
	],
	authController.createUser
)
module.exports = router
