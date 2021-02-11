const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

exports.signup = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.data = errors.array()
    throw error;
  }
  const email = request.body.email
  const name = request.body.name
  const password = request.body.password
  bcrypt.hash(password, 12)
  .then(hashedPassword => {
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name
    })
    return user.save()
  })
  .then(result => {
    response.status(201).json({ message: 'User created!', userId: result._id })
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}