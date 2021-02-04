const express = require('express')
const { body } = require('express-validator')
const multer = require('multer')
const router = express.Router()
const menuController = require('../controllers/menu')

const fileStorage = multer.diskStorage({
	desination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null) //eta dekhi baki
	}
})

router.get('/', menuController.getItems)
router.post(
	'/',
	[
		body('name')
			.trim()
			.isLength({ min: 2 })
			.withMessage('Must be minimum 2 characters long'),
		body('price').trim().not().isEmpty().withMessage('cannot Be Empty'),
		body('details')
			.trim()
			.isLength({ min: 10 })
			.withMessage('Minimum length is 10 characters Long')
	],
	menuController.createMenu
)
router.get('/Item/:itemName', menuController.getItem)
module.exports = router
