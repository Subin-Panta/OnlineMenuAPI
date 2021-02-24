const express = require('express')
const { body } = require('express-validator')
const router = express.Router()

const orderController = require('../controllers/order')
//first just create and store orders
//viewing orders needs authentication
//express validator package and verify inputs
//new order model required
//model ma customer details,invoice path,order number stored

router.post(
	'/generateOrder',
	[
		body('name').trim().not().isEmpty(),
		body('phoneNo').trim().not().isEmpty(),
		body('address').trim().not().isEmpty()
	],
	orderController.orderBuiler
)
router.get('/getOrders', authentication, orderController.getAllOrders)
router.get(
	'/invoice/:invoiceId',
	authentication,
	orderController.getSingleOrder
)
module.exports = router
