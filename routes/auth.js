const express = require('express')
const { body, check } = require('express-validator')
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
		body('password').trim().not().isEmpty().isLength({ min: 6 }),
		body('confirmPassword').custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Password must match')
			}
			return true
		})
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
router.get('/verifyToken', authController.checkToken)
router.post('/logout', authentication, authController.logout)
router.post('/deleteItem/:itemid', authentication, authController.delete)
router.post('/editItem/:itemid', authentication, authController.edit)
router.post('/verifyUser', authController.verify)
router.get('/allUsers', authentication, authController.list)
router.post('/deleteUser', authentication, authController.deleteUser)
module.exports = router
