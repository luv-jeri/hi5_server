const User = require('../database/models/user.model');
const _Error = require('../utils/_Error');
const catch_async = require('../utils/catch_async');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const send_mail = require('../utils/send_mail');
const mongoose = require('mongoose');

module.exports.signUp = catch_async(async (req, res, next) => {
  const { name, email, password, confirmPassword, photo, push_token } = req.body;

  if (password !== confirmPassword) {
    return next(new _Error('Passwords do not match 😁😁', 400));
  }

  const random_username = name + Math.random().toString(36).substring(7);

  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
    username: random_username,
    photo,
    push_token,
  });

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );

  res.cookie('authorization', token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 'success',
    message: `Welcome ${user.name}`,
    data: { token },
  });
});

module.exports.signIn = catch_async(async (req, res, next) => {
  const { email, password, push_token } = req.body;
  console.log(push_token);

  // if (!email) {
  //   return next(new _Error('Please provide email ', 400));
  // }

  if (!password) {
    return next(new _Error('Please provide password', 400));
  }

  const user = await User.findOneAndUpdate(
    {
      email,
    },
    {
      push_token,
    }
  ).select('+password');

  if (!user) {
    return next(new _Error('Invalid Email/User', 401));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new _Error('Password is wrong.', 401));
  }

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      // username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );

  // # EXPLAIN THE BELOW LINE
  res.cookie('authorization', token, {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(200).json({
    status: 'success',
    message: `Welcome back ${user.name}`,
    data: { token },
  });
});

module.exports.forgotPassword = catch_async(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new _Error('User with that email does not exist', 404));
  }

  await user.generateOTP();

  await send_mail({
    to: email,
    subject: 'Reset Password OTP ',
    text: `Your OTP is ${user.OTP}`,
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to your email',
  });
});

module.exports.resetPassword = catch_async(async (req, res, next) => {
  const { OTP } = req.query;
  const { password, confirmPassword } = req.body;

  if (!OTP) {
    return next(new _Error('Please provide OTP', 400));
  }

  const user = await User.findOne({ OTP });

  if (!user) {
    return next(new _Error('Invalid OTP', 404));
  }

  if (user.OTPExpiry < Date.now()) {
    return next(new _Error('OTP expired', 404));
  }

  if (password !== confirmPassword) {
    return next(new _Error('Passwords do not match 😁😁', 400));
  }

  user.password = password;
  user.confirmPassword = confirmPassword;

  user.OTP = undefined;
  user.OTPExpiry = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully',
  });
});


