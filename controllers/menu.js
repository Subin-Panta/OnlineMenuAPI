const { validationResult } = require('express-validator')
const Item = require('../models/items')
exports.getItems = async (req, res, next) => {
	// console.log(req)
	// //need to fetch data from mongoDB
	// console.log('Cookies: ', req.cookies)
	try {
		const items = await Item.find()
		res.status(200).json({
			msg: 'Succesful Fetch',
			items
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
			next(error)
		}
	}
}
exports.createMenu = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed, entered Data is incorrect')
		error.statusCode = 422
		next(error)
	}
	const name = req.body.name
	const price = req.body.price
	const details = req.body.details
	const imageUrl = req.body.imageUrl
	const item = new Item({
		name,
		price,
		details,
		imageUrl
	})
	try {
		const result = await item.save()
		res.status(201).json({
			result,
			message: 'Item Created'
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}
exports.getItem = async (req, res, next) => {
	const Name = req.params.itemName
	try {
		const item = await Item.find({ name: Name })
		if (!item) {
			const error = new Error('No Such Item')
			error.statusCode = 404
			next(error)
		}
		res.status(200).json({ msg: 'Item Fetched', item })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
			next(error)
		}
	}
}
