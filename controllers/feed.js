const { validationResult } = require('express-validator')
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')


exports.getPosts = (request, response, next) => {
  Post.find()
  .then(posts => {
    response.status(200).json({ message: 'Fetched psots successfully', posts: posts})
  })
  .catch(error => {
    if (error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  })
}

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: { name: 'Maximilian' }
  });
  post
    .save()
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: result
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (request, response, next) => {
  const postId = request.params.postId
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.')
        error.statusCode = 404
        throw error
      }
      response.status(200).json({ message: 'Post fetched', post: post })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500
      }
      next(error)
    })
}

exports.updatePost = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const postId = request.params.postId
  const title = request.body.title
  const content = request.body.content
  let imageUrl = request.body.image
  if (request.file) {
    imageUrl = request.file.path
  }
  console.log('imageUrl', imageUrl)

  if (!imageUrl) {
    const error = new Error('No file picked.')
    error.statusCode = 422
    throw error
  }
  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl)
    }
    post.title = title
    post.imageUrl = imageUrl
    post.content = content
    // console.log('editted post', post)
    return post.save()
  })
  .then(result => {
    response.status(200).json({ message: 'Post updated!', post: result })
  })
  .catch(error => {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  })
}

exports.deletePost = (request, response, next) => {
  const postId = request.params.postId
  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }
    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId)
  })
  .then(result => {
    console.log(result)
    response.status(200).json({ message: 'Deleted post.' })
  })
  .catch(error => {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  })
}

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, error => console.log(error))
}