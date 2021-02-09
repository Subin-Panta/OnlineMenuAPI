const bcrypt = require('bcryptjs')
const config = require('config')
const csrfSecret = config.get('csrfSecret')
const secret = config.get('secret')
const jwt = require('jsonwebtoken')
module.exports = authentication = async (req, res, next) => {
	const cToken = req.headers['authorization']
	const cookie = req.cookies.Token

	try {
		const decode = await jwt.verify(cookie, secret)
		console.log('decoded', decode)
		console.log(cToken)
		const csToken = decode.csrfToken
		console.log(csToken)
		const result = await bcrypt.compare(csToken, cToken)
		if (!result) {
			return res.send('Not Authorized')
		}
		console.log('Matches')
		next()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
