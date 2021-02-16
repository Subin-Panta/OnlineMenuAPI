const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const User = require('../models/user')
const authController = require('../controllers/auth')
const authentication = require('../middleware/authentication')
const csrfprotection = require('../middleware/csrfProtection')
router.post(
	'/',
	[
		body('name').trim().not().isEmpty(),
		body('email').trim().isEmail().normalizeEmail(),
		body('password').trim().not().isEmpty().isLength({ min: 6 })
	],
	authController.createUser
)
router.post(
	'/postLogin',
	[
		body('email').custom(async value => {
			const user = await User.find({ email: value })
			if (!user.length) {
				throw new Error('Invalid Credentials')
			}
			return true
		}),
		csrfprotection
	],

	authController.validateUser
)
router.get('/verifyToken', authentication, authController.checkToken)
router.post('/logout', authentication, authController.logout)
router.post('/deleteItem/:itemid', authentication, authController.delete)
router.post('/editItem/:itemid', authentication, authController.edit)
module.exports = router
