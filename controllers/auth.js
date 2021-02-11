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
	const csrfToken = req.token

	// console.log('yehi ho csrf token', csrfToken)
	try {
		const user = await User.findOne({ email })
		if (!user) {
			throw new Error('Invalid Credentials')
		}
		const result = await bcrypt.compare(password, user.password)
		if (result) {
			const secret = config.get('secret')
			const payload = {
				id: user._id,
				name: user.name,
				email: user.email,
				csrfToken
			}
			const token = jwt.sign(payload, secret, { expiresIn: '2h' })
			const HashedcsrfToken = await bcrypt.hash(csrfToken, 12)
			return res
				.status(200)
				.cookie('Token', token, { httpOnly: true, sameSite: 'LAX' })
				.json({ Id: user.id, HashedcsrfToken, name: user.name })

			//return res.status(200).json({ msg: 'success' })
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
exports.checkToken = async (req, res, next) => {
	const secret = config.get('secret')
	const cookie = req.cookies.Token
	try {
		const decode = await jwt.verify(cookie, secret)
		const user = await User.findById(decode.id)
		res.status(200).json({ Id: decode.id, name: user.name })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
exports.dummy = (req, res, next) => {
	res.send('Big Dumb DUmb')
}
exports.logout = (req, res, next) => {
	return res.status(200).clearCookie('Token').json({ msg: 'cookie cleared' })
}
