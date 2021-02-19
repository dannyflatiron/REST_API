const bcrypt = require('bcryptjs');
const validator = require('validator');

const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, req) {
    //   const email = args.userInput.email;
    const errors = []
    if (!validtor.isEmail) {
      errors.push({ message: 'Email is invalid!'})
    }
    if (validator.isEmpty(userInput.pass) || !validtor.isLength(userInput.password, { min: 5 })) {
      errors.push({ message: 'Password too short! '})
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.')
      throw error
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error('User exists already!');
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  }
};