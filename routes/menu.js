const express = require('express')
const { body } = require('express-validator')
const router = express.Router()
const menuController = require('../controllers/menu')
const authentication = require('../middleware/authentication')

router.get('/', menuController.getItems)
router.post(
	'/',
	[
		authentication,
		body('name')
			.trim()
			.isLength({ min: 2 })
			.withMessage('Must be minimum 2 characters long'),
		body('price').trim().not().isEmpty().withMessage('cannot Be Empty'),
		body('details')
			.trim()
			.isLength({ min: 10 })
			.withMessage('Minimum length is 10 characters Long'),
		body('ingredients').trim().not().isEmpty()
	],
	menuController.createMenu
)
router.get('/Item/:itemName', menuController.getItem)
router.post('/order', menuController.order)
module.exports = router
