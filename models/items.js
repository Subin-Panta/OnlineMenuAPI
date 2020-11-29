const mongoose = require('mongoose')
const Schema = mongoose.Schema
const itemSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	details: {
		type: String,
		required: true
	},
	imageUrl: {
		type: String
	}
})
module.exports = mongoose.model('Item', itemSchema)
