const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports.authenticate = catch_async(async (req, res, next) => {
  let { authorization } = req.headers;

  if (!authorization) {
    authorization = req.cookies.authorization;
  }

  

  let token;

  if (authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  token = authorization;

  if (!token) {
    return next(new _Error('Please login to continue', 400));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new _Error('You are logged out.', 401));
  }

  const user = await User.findById(decoded.id);

  req.user = user;

  next();
});

module.exports.whoami = catch_async(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new _Error('Please login to continue', 400));
  }



  const decoded = await promisify(jwt.verify)(authorization, process.env.JWT_SECRET);

  if (!decoded) {
    return next(new _Error('You are logged out.', 401));
  }

  const user = await User.findById(decoded.id);

  res.status(200).json({
    status: 'success',
    message: `You are ${user.name}`,
    data: user,
  });
});
