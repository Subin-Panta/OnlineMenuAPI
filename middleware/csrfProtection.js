const { v4: uuidv4 } = require('uuid')

const config = require('config')

module.exports = csrfProtection = async (req, res, next) => {
	try {
		const csrfToken = uuidv4()
		req.token = csrfToken

		next()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
