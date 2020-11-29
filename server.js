const express = require('express')
const config = require('config')
const mongoose = require('mongoose')

const menuRoutes = require('./routes/menu')
const app = express()
const PORT = process.env.port || 8000
const mongoURI = config.get('mongoURI')

//bodyparser
app.use(express.json()) // application/json
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
//routes
app.use('/menu', menuRoutes)
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
