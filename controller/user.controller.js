const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');

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
  });


  res.status(200).json({
    status: 'success',
    data: users,
    message: 'Retrieved all users',
  });
});


