const bcrypt = require('bcryptjs')

const secret = process.env.secret
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const mongoose = require('mongoose')
module.exports = authentication = async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.headers['userid'])
	const cToken = req.headers['authorization']
	const cookie = req.cookies.Token
	if (!cToken || !cookie || !userId) {
		return res.status(401).json({ msg: 'Not Authorized 1' })
	}
	//additional check if users Status is authorized
	try {
		const decode = await jwt.verify(cookie, secret)
		const csToken = decode.csrfToken
		const result = await bcrypt.compare(csToken, cToken)
		const user = await User.findOne({ _id: userId })
		if (!user) {
			return res.status(404).json({ msg: 'No User' })
		}
		if (!result || !user.verified) {
			return res.status(401).json({ msg: 'Not Authorized' })
		}
		//get user too and check his authentication status on the mongodb
		next()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
