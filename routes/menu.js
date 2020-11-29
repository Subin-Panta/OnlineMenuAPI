const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const menuController = require('../controllers/menu')
router.get('/', menuController.getItems)
router.post(
	'/',
	[
		body('name')
			.trim()
			.isLength({ min: 5 })
			.withMessage('Must be minimum 5 characters long'),
		body('price').trim().not().isEmpty().withMessage('cannot Be Empty'),
		body('details')
			.trim()
			.isLength({ min: 10 })
			.withMessage('Minimum length is 10 characters Long')
	],
	menuController.createMenu
)
module.exports = router
