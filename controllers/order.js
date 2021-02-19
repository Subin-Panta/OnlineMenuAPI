const path = require('path')
const fs = require('fs')
const { validationResult } = require('express-validator')
const PDFDocument = require('pdfkit')
const Order = require('../models/order')
const Item = require('../models/items')

exports.orderBuiler = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed, entered Data is incorrect')
		error.statusCode = 422
		return next(error)
	}
	const name = req.body.name
	const phoneNo = req.body.phoneNo
	const address = req.body.address
	const additionalDetails = req.body.additionalDetails || ''
	const recievedOrderData = req.body.order
	console.log(recievedOrderData)
	try {
		//get total using reciievedOrderData
		const obj = recievedOrderData
		//convert object to array containing keys only
		const arr = Object.keys(obj)
		let total = 0
		//map
		//For of loop
		for (var item of arr) {
			const res = await Item.find({ name: item })
			if (!(res.length > 0)) {
				const error = new Error('No Such Item')
				error.statusCode = 404
				throw error
			}
			total = total + res[0].price * obj[item]
		}

		//put the orderData and total in model and save
		const order = new Order({
			name,
			phoneNo,
			address,
			additionalDetails,
			order: recievedOrderData,
			total
		})
		const result = await order.save()
		const orderId = result._doc._id.toString()
		//invoice path and invoice name
		const invoiceName = 'Invoice-' + orderId + '.pdf'
		const invoicePath = path.join('data', 'invoices', invoiceName)
		//create pdfkit and stream data
		const pdfDoc = new PDFDocument()
		//setting header for letting browser know that its a pdf file
		//dont need to setheader cause i am hanlding stream on react with react code
		// res.setHeader('Content-Type', 'application/pdf')
		// //header for setting file Name and opened in new tab
		// res.setHeader(
		// 	'Content-Disposition',
		// 	'inline; filename="' + invoiceName + '"'
		// )
		//pipe to witestream to create a write stream that saves file on the server
		pdfDoc.pipe(fs.createWriteStream(invoicePath))
		//pipe to res which is a writeable stream so that we can stream the created file to res
		pdfDoc.pipe(res)
		//create pdf
		pdfDoc.fontSize(26).text('Invoice')
		pdfDoc.text('---------------------------------------')
		pdfDoc.fontSize(10)
		//loop thorugh object
		for (var a in obj) {
			pdfDoc.text(`${a}: ${obj[a]}`)
		}
		pdfDoc.text('------------------------------------------')
		pdfDoc.text(`Total Price :Rs ${total}`)
		//ending the stream created by pdfDoc
		pdfDoc.end()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
exports.getAllOrders = async (req, res, next) => {
	try {
		const result = await Order.find()
		res.status(200).json({ result })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}
exports.getSingleOrder = (req, res, next) => {
	console.log('ayy bitch')
	const invoiceId = req.params.invoiceId
	//create a read Stream
	const invoicePath = path.join(
		__dirname,
		`../data/invoices/Invoice-${invoiceId}.pdf`
	)

	const file = fs.createReadStream(invoicePath)
	file.pipe(res)
	file.on('error', error => {
		next(error)
	})
	//pipe the read stream into res
}
//add route for deleting orders too need this once the orders can be checked off or not really a good idea since we might need invoices
