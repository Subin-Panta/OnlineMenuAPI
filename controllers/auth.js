const { validationResult } = require('express-validator')
const config = require('config')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Item = require('../models/items')
const mongoose = require('mongoose')
exports.createUser = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Enter Correct Data')
		error.statusCode = 422
		return next(error)
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
		return next(error)
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
		return next(error)
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
		return next(error)
	}
}
exports.delete = async (req, res, next) => {
	const id = req.params.itemid
	const objectId = new mongoose.Types.ObjectId(id)

	try {
		const response = await Item.findOneAndDelete({ _id: objectId })
		if (!response) {
			return res.status(404).json({ msg: 'not found' })
		}
		res.status(200).json({ msg: 'deleted' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
exports.edit = async (req, res, next) => {
	const id = req.params.itemid

	try {
		const objectId = new mongoose.Types.ObjectId(id)
		const oldData = await Item.find({ _id: objectId })
		if (!oldData) {
			const error = new Error('No Such Item')
			error.statusCode = 404
			throw error
		}

		let newIngredients = null
		let newImageUrl = null
		if (req.body.ingredients) {
			newIngredients = req.body.ingredients.split(',').map(item => item.trim())
		} else {
			newIngredients = [...oldData[0].ingredients]
		}
		if (req.file) {
			newImageUrl = req.file.path
		} else {
			newImageUrl = oldData[0].imageUrl
		}
		const newData = {
			name: req.body.name || oldData[0].name,
			price: req.body.price || oldData[0].price,
			details:
				req.body.details && req.body.details.length >= 10
					? req.body.details
					: oldData[0].details,
			ingredients: newIngredients,
			imageUrl: newImageUrl
		}

		const response = await Item.findOneAndUpdate(
			{ _id: objectId },
			{ ...newData }
		)
		if (!response) {
			throw new Error('Try Again Later')
		}
		res.status(200).json({ msg: 'Updated' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
exports.logout = (req, res, next) => {
	return res.status(200).clearCookie('Token').json({ msg: 'cookie cleared' })
}
