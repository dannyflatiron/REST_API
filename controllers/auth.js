const User = require('../models/user')
const { validationResult } = require('express-validator')

exports.signup = (request, response, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array()
    throw error;
  }
  const email = request.body.email
  const name = request.body.name
  const password = request.body.password
}