const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');

module.exports.updateUser = catch_async(async (req, res, next) => {
  const { email, photo, username, bio, name } = req.body;
  const { _id } = req.user;

  const user = await User.findById(_id);

  if (!user) return next(new _Error('User not found with this ID 🥺', 404));

  if (email) user.email = email;
  if (photo) user.photo = `http://localhost:8000/upload/${photo}`;
  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (name) user.name = name;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: user,
    message: `hey, ${user.name} you are up to date 😁.`,
  });
});

module.exports.getUser = catch_async(async (req, res, next) => {
  const users = await User.find({
    email: {
      $ne: req.user.email,
    },
  });

  res.status(200).json({
    status: 'success',
    data: users,
    message: 'Retrieved all users',
  });
});

module.exports.lookup = catch_async(async (req, res, next) => {
  const { q } = req.query;

  const users = await User.find({
    $or: [
      {
        name: {
          $regex: q,
          $options: 'i',
        },
      },
      {
        email: {
          $regex: q,
          $options: 'i',
        },
      },
    ],
    _id: {
      $ne: req.user._id,
    },
    blocked: {
      $nin: req.user._id,
    },
  });

  res.status(200).json({
    status: 'success',
    data: users,
    message: 'Retrieved all users',
  });
});
