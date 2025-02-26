const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	verified: {
		type: Boolean,
		default: false
	},
	token: {
		type: String
	},
	tokenExpires : {
		type: Date
	}
})
module.exports = mongoose.model('User', userSchema)
