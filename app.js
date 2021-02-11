const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose')

const feedRoutes = require('./routes/feed')

const app = express()

app.use(bodyParser.json()) // application/json
// server images statically
app.use('/images', express.static(path.join(__dirname, 'images')))

// resolve CORS problem
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/feed', feedRoutes)

app.use((error, request, response, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  response.status(status).json({ message: message })
})

mongoose.connect(
  `mongodb+srv://dannyreina:${process.env.PASSWORD}@cluster0.vnxsz.mongodb.net/network?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => 
  {
    app.listen(8080)
  })
  .catch(err => console.log(err))
