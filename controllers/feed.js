const { validationResult } = require('express-validator')
const Post = require('../models/post')
const User = require('../models/user')
const fs = require('fs')
const path = require('path')
const io = require('../socket')


exports.getPosts = async (request, response, next) => {
  const currentPage = request.query.page || 1
  const perPage = 2
  try {
  const totalItems = await Post.find().countDocuments()
  const posts = await Post.find()
    .populate('creator')
    .sort({createdAt: -1})
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
  
    response.status(200).json({ 
      message: 'Fetched psots successfully', 
      posts: posts, 
      totalItems: totalItems
    })
  } catch (error) {
    if (error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

exports.createPost = async (req, res, next) => {
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
    creator: req.userId
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit('posts', {
      action: 'create',
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.getPost = async (request, response, next) => {
  const postId = request.params.postId
  const post = await Post.findById(postId)
  try {
    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }
    response.status(200).json({ message: 'Post fetched', post: post })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

// ###### FINISH APPLYING ASYCN AWAIT TO REMAINING FUNCTIONS HERE & IN AUTH.JS

exports.updatePost = async (request, response, next) => {
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
  try {
    const post = await Post.findById(postId).populate('creator')
    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }
    if (post.creator._id.toString() !== request.userId) {
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
    const result = await post.save()
    io.getIO().emit('posts', { action: 'update', post: result })
    response.status(200).json({ message: 'Post updated!', post: result })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500
    }
    next(error)
  }
}

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId
  try {
    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!')
      error.statusCode = 403
      throw error
    }
    clearImage(post.imageUrl)
    await Post.findByIdAndRemove(postId)

    const user = await User.findById(req.userId)
    user.posts.pull(postId)
    await user.save()
    io.getIO().emit('posts', { action: 'delete', post: postId })
    res.status(200).json({ message: 'Deleted post.' })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath)
  fs.unlink(filePath, error => console.log(error))
}