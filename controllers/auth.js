const User = require('../models/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

exports.login = (request, response, next) => {
  const email = request.body.email
  const password = request.body.password
  let loadedUser
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this email could not be found.')
        error.statusCode = 401
        throw error
      }
      loadedUser = user
      return bcrypt.compare(password, user.password)
    })
  .then(isEqual => {
    if (!isEqual) {
      const error = new Error('Wrong password.')
      error.statusCode = 401
      throw error
    }
    const token = jwt.sign(
      { 
        email: loadedUser.email, 
        userId: loadedUser._id.toString() 
      }, 
      `${process.env.JWT}`,
      { expiresIn: '1h'}
    )
    response.status(200).json({ token: token, userId: loadedUser._id.toString() })
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}

exports.getUserStatus = (request, response, next) => {
User.findById(request.userId)
  .then(user => {
    if (!user) {
      const error = new Error('User not found.')
      error.statusCode = 404
      throw error
    }
    response.status(200).json({ status: user.status })
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
}

exports.updateUserStatus = (request, response, next) => {
  const newStatus = request.body.status
  User.findById(request.userId)
  .then(user => {
    if (!user) {
      const error = new Error('User not found.')
      error.statusCode = 404
      throw error
    }
    user.status = newStatus
    return user.save()
  })
  .then(result => {
    response.status(200).json({ message: 'User udpated.' })
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
  }