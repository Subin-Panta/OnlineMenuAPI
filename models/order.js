const mongoose = require('mongoose')
const Schema = mongoose.Schema
const orderSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		phoneNo: {
			type: Number,
			required: true
		},
		address: {
			type: String,
			required: true
		},
		additionalDetails: {
			type: String
		},
		order: {
			type: Object,
			required: true
		},
		total: {
			type: Number,
			required: true
		}
	},
	{ timestamps: true }
)
module.exports = mongoose.model('Order', orderSchema)
