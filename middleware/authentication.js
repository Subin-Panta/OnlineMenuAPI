const bcrypt = require('bcryptjs')
const config = require('config')
const csrfSecret = config.get('csrfSecret')
const secret = config.get('secret')
const jwt = require('jsonwebtoken')
module.exports = authentication = async (req, res, next) => {
	const cToken = req.headers['authorization']
	const cookie = req.cookies.Token
	console.log('header', cToken)
	console.log('cookie', cookie)
	if (!cToken || !cookie) {
		return res.status(401).json({ msg: 'Not Authorized 1' })
	}
	try {
		const decode = await jwt.verify(cookie, secret)
		const csToken = decode.csrfToken
		const result = await bcrypt.compare(csToken, cToken)
		if (!result) {
			return res.status(401).json({ msg: 'Not Authorized' })
		}
		next()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
