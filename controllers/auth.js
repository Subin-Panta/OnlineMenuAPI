const { validationResult } = require('express-validator')
exports.createUser = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		error.statusCode = 422
		next(error)
	}
	const email = req.body.email
	const password = req.body.password
}
