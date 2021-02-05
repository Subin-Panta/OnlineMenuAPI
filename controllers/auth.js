const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
exports.createUser = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Enter Correct Data')
		error.statusCode = 422
		next(error)
	}
	const name = req.body.name
	const email = req.body.email
	const password = req.body.password
	try {
		const hashedPassword = await bcrypt.hash(password, 12)
		const user = new User({
			name,
			email,
			password: hashedPassword
		})
		await user.save()
		res.status(201).json({ msg: 'User Created' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
exports.validateUser = async (req, res, next) => {}
