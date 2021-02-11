const { validationResult } = require('express-validator')


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
    return response.status(422).json(
      { message: 'Validation failed, entered data is incorrect.',
        errors: errors.arrray()
      }
    )
  }
  const title = request.body.title
  const content = request.body.content
  response.status(201).json({
    message: 'Post created!',
    post: { 
      _id: new Date().toISOString(), 
      title: title, 
      content: content,
      creator: {
        name: 'Danny'
      },
      createAt: new Date()
    }
  })
}