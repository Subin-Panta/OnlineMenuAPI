const { validationResult } = require('express-validator')

const bcrypt = require('bcryptjs')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Item = require('../models/items')
const mongoose = require('mongoose')
const fs = require('fs/promises')
const path = require('path')
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto')
const sendGridKey = process.env.sendgridApiKey
const superUser = process.env.superUser
const sender = process.env.sender
sgMail.setApiKey(sendGridKey)
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
		const checkUser = await User.findOne({ email })
		if (checkUser) {
			throw new Error('User Already Exists')
		}
		const buffer = await crypto.randomBytes(32)
		const token = buffer.toString('hex')
		const user = new User({
			name,
			email,
			password: hashedPassword,
			token,
			tokenExpires: Date.now() + 900000
		})

		const msg = {
			to: superUser,
			from: sender, // Use the email address or domain you verified above
			subject: 'Verify User to Continue',
			html: `<form method="POST" action="https://afternoon-tundra-60689.herokuapp.com/auth/verifyUser">
			<input name='token' type="hidden"  value=${token} />
			<input name='userId' type="hidden" value=${user._id} />
            <button type="submit">Verify</button>
            </form>`
		}

		//send email to the a fixed superUSER WHO HAS A TOKEN
		//store an encrypted hashed id at the users base
		await sgMail.send(msg)
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
			const secret = process.env.secret
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
	const secret = process.env.secret
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
		const image = await Item.findOne({ _id: objectId })
		const response = await Item.findOneAndDelete({ _id: objectId })
		if (!response) {
			return res.status(404).json({ msg: 'not found' })
		}
		const pathname = path.join(__dirname, `.././/${image.imageUrl}`)
		console.log(pathname)
		await fs.unlink(pathname)
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
		if (!(oldData.length > 0)) {
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
exports.verify = async (req, res, next) => {
	const code = req.body.token
	const userId = req.body.userId
	if (!code || !userId) {
		return res.status(422).json({ msg: 'invalid Input' })
	}
	const userIdConverted = new mongoose.Types.ObjectId(userId)

	const time = new Date()
	const user = await User.findById({ _id: userIdConverted })
	if (!user) {
		return res.status(404).json({ msg: 'no User' })
	}
	if (!user.token || !user.tokenExpires) {
		return res.status('500').json({ msg: 'Already Authenticated' })
	}
	if (!(time < user.tokenExpires) || user.token !== code) {
		//if the token is expired{}
		if (!(time < user.tokenExpires)) {
			//update token
			const buffer = await crypto.randomBytes(32)
			const newToken = buffer.toString('hex')
			//update database
			user.token = newToken
			user.tokenExpires = Date.now() + 900000
			await user.save()
			//resend token to mail
			const msg = {
				to: superUser,
				from: sender, // Use the email address or domain you verified above
				subject: 'Verify User to Continue',
				html: `<form method="POST" action="http://localhost:8000/auth/verifyUser">
				<input name='token' type="hidden"  value=${newToken} />
				<input name='userId' type="hidden" value=${user._id} />
				<button type="submit">Verify</button>
				</form>`
			}

			//send email to the a fixed superUSER WHO HAS A TOKEN
			await sgMail.send(msg)
		}
		return res.status(401).json({ msg: 'token invalid' })
	} else {
		user.verified = true
		user.token = null
		user.tokenExpires = null
		await user.save()
		return res.status(200).json({ msg: 'verified' })
	}
	//Since this is a post request if the code is expired
	//generate new code and stuff it in the database
	//check whether code matches and whether or not it is still valid for that user
	//if not valid
	//return INVALID TOKEN REQUEST TOKEN AGAIN FROM THE ONLINE MENU SITE
}
exports.list = async (req, res, next) => {
	try {
		const users = await User.find().select([
			'-token',
			'-password',
			'-tokenExpires'
		]) //get all users
		if (!users) {
			res.status(200).json({ msg: 'No Users' })
		}
		res.status(200).json({ users })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
exports.deleteUser = async (req, res, next) => {
	const id = req.body.id
	const userId = new mongoose.Types.ObjectId(id)
	try {
		const exists = User.findOne({ _id: userId })
		if (!exists) {
			throw new Error('No Such User')
		}
		const user = await User.findOneAndDelete({ _id: userId })
		return res.status(200).json({ msg: 'User Deleted' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
