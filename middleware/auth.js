const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    request.isAuth = false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, `${process.env.JWT}`);
  } catch (err) {
    request.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    request.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true
  next();
};

