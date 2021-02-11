const { validationResult } = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')
const fs = require('fs')
const path = require('path')


exports.getPosts = (request, response, next) => {
  const currentPage = request.query.page || 1
  const perPage = 2
  let totalItems
  Post.find()
  .countDocuments()
  .then(count => {
    totalItems = count
    return Post.find()
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
  })
  .then(posts => {
    response.status(200).json({ 
      message: 'Fetched psots successfully', 
      posts: posts, 
      totalItems: totalItems})
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
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });
  post
    .save()
    .then(result => {
      return User.findById(req.userId);
    })
    .then(user => {
      creator = user;
      user.posts.push(post);
      return user.save();
    })
    .then(result => {
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: { _id: creator._id, name: creator.name }
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
    if (post.creator.toString() !== request.userId) {
      const error = new Error('Not authorized.')
      error.statusCode = 403
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
    if (post.creator.toString() !== request.userId) {
      const error = new Error('Not authorized.')
      error.statusCode = 403
      throw error
    }
    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId)
  })
  .then(result => {
    return User.findById(request.userId)
  })
  .then(user => {
    user.posts.pull(postId)
    return user.save()
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