const express = require('express')
const path = require('path')
const config = require('config')
const mongoose = require('mongoose')
const cookieparser = require('cookie-parser')
//routes
const menuRoutes = require('./routes/menu')
const authRoutes = require('./routes/auth')
const app = express()
const PORT = process.env.port || 8000
const mongoURI = config.get('mongoURI')

//cookieparser
app.use(cookieparser())
//bodyparser
app.use(express.json()) // application/json
//Statically serving images
app.use('/images', express.static(path.join(__dirname, 'images')))
//CORS ISSUE SOLVER
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	)
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
	next()
})
app.use('/menu', menuRoutes)
app.use('/auth', authRoutes)
//error handling middleware
app.use((error, req, res, next) => {
	console.log(error)
	const status = error.statusCode || 500
	const message = error.message ? error.message : error.msg ? error.msg : error
	res.status(status).json({ message })
})
//connecting to database
const run = async () => {
	try {
		await mongoose.connect(mongoURI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})
		console.log('mongoDb Connected')
		app.listen(PORT)
		console.log('listening in ' + PORT)
	} catch (error) {
		console.log(error)
	}
}
run().catch(err => console.log(err))
