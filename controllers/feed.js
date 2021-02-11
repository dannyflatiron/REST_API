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