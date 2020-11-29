const { validationResult } = require('express-validator')

exports.getItems = (req, res, next) => {
	res.status(200).json({
		items: [
			{
				name: 'MOMO',
				price: '100'
			},
			{
				name: 'Burger',
				price: '150'
			},
			{
				name: 'Pizza',
				price: '250'
			},
			{
				name: 'Chowmein',
				price: '100'
			},
			{
				name: 'Fried Rice',
				price: '50'
			},
			{
				name: 'Naan',
				price: '100'
			}
		]
	})
}
exports.createMenu = (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		//use a error handling middleware but for now fuck it
		return res.status(422).json({
			message: 'entered Data is Incoorect',
			errors: errors.array()
		})
	}
	const name = req.body.name
	const price = req.body.price
	const details = req.body.details
	const imageUrl = req.body.imageUrl
	//create it in Db
	res.status(201).json({
		message: 'Item Created'
	})
}
