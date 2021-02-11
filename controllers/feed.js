const { validationResult } = require('express-validator')
const Post = require('../models/post')


exports.getPosts = (request, response, next) => {
  response.status(200).json({
    posts: [{ 
      title: 'First Post', 
      content: 'Hello World!', 
      imageUrl: 'images/skyline.jpg',
      creator: {
        name: 'Danny'
      },
      createAt: new Date()
    }]
  })
}

exports.createPost = (request, response, next) => {
  const errors = validationResult(request)
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.')
    error.statusCode = 422
    throw error
  }
  const title = request.body.title
  const content = request.body.content
  const post = new Post({
    title: title, 
    content: content,
    imageUrl: 'images/skyline.jpg',
    creator: {
      name: 'Danny'
    }
  })
  post.save()
  .then(result => {
    response.status(201).json({
      message: 'Post created!',
      post: result
    })
  })
  .catch(error => {
    if (error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  })
}