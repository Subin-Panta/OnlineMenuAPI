const { validationResult } = require('express-validator')
const config = require('config')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
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
exports.validateUser = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const err = errors.errors[0].msg
		next(err)
	}
	const email = req.body.email
	const password = req.body.password
	try {
		const user = await User.findOne({ email })
		const result = await bcrypt.compare(password, user.password)
		if (result) {
			const secret = config.get('secret')
			const payload = {
				name: user.name,
				email: user.email
			}
			const token = jwt.sign(payload, secret, { expiresIn: '1h' })
			return res.status(200).json({ token })
		}
		const error = new Error('Invalid Credentials')
		throw error
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
