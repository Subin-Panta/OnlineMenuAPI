const express = require('express')
const path = require('path')
const config = require('config')
const mongoose = require('mongoose')
const cookieparser = require('cookie-parser')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')
//routes
const menuRoutes = require('./routes/menu')
const authRoutes = require('./routes/auth')
const orderRoutes = require('./routes/order')
const app = express()
const PORT = process.env.port || 8000
const mongoURI = config.get('mongoURI')
//fileStorage for multer
const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'images')
	},
	filename: (req, file, cb) => {
		cb(null, uuidv4() + file.originalname)
	}
})
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true) //i.e null error and true means store
	} else {
		cb(null, false) //i.e no error and false means don't store
	}
}
//bodyparser
app.use(express.json()) // application/json
//cookieparser
app.use(cookieparser())
//file parser
app.use(
	multer({
		storage: fileStorage,
		fileFilter,
		limits: { fileSize: 1024 * 1024 * 1024 * 1024 }
	}).single('image')
)

//Statically serving images //static request to going to /images will be served from the path defined inside static function
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
app.use('/order', orderRoutes)
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
			useUnifiedTopology: true,
			useFindAndModify: false
		})
		console.log('mongoDb Connected')
		app.listen(PORT)
		console.log('listening in ' + PORT)
	} catch (error) {
		console.log(error)
	}
}
run().catch(err => console.log(err))
