const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose')
const multer = require('multer')
const { graphqlHTTP } = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');


const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express()

app.use(bodyParser.json()) // application/json
// store file and retrieve single files
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

// server images statically
app.use('/images', express.static(path.join(__dirname, 'images')))

// resolve CORS problem
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

app.use((error, request, response, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  response.status(status).json({ message: message, data: data })
})

mongoose.connect(
  `mongodb+srv://dannyreina:${process.env.PASSWORD}@cluster0.vnxsz.mongodb.net/network?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err))
