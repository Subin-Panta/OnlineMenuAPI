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
			return next(error)
		}
	}
}
exports.createMenu = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed, entered Data is incorrect')
		error.statusCode = 422
		return next(error)
	}
	const name = req.body.name
	const price = req.body.price
	const details = req.body.details
	const ingredients = req.body.ingredients
	const image = req.file
	if (!image) {
		const error = new Error(
			'image is required and only .png,.jpg and .jpeg files are supported'
		)
		error.statusCode = 422
		return next(error)
	}
	const imageUrl = image.path
	const arryIngredients = ingredients.split(',').map(item => item.trim())

	const item = new Item({
		name,
		price,
		details,
		imageUrl,
		ingredients: arryIngredients
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
		return next(error)
	}
}
exports.getItem = async (req, res, next) => {
	const Name = req.params.itemName
	try {
		const item = await Item.find({ name: Name })
		if (!(item.length > 0)) {
			const error = new Error('No Such Item')
			error.statusCode = 404
			return next(error)
		}
		res.status(200).json({ msg: 'Item Fetched', item })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
			return next(error)
		}
	}
}
exports.order = async (req, res, next) => {
	if (!req.body.bill) {
		return res.status(204).json({ msg: 'empty' })
	}
	const obj = req.body.bill

	//convert object to array containing keys only
	const arr = Object.keys(obj)

	let total = 0
	//map
	//For of loop
	for (var item of arr) {
		try {
			const res = await Item.find({ name: item })
			if (!(res.length > 0)) {
				const error = new Error('No Such Item')
				error.statusCode = 404
				return next(error)
			}
			total = total + res[0].price * obj[item]
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500
				return next(error)
			}
		}
	}
	res.status(200).json({ total })
}
