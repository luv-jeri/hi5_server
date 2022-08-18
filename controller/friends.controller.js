const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');

// # axios.post('/friends/6dt45308b)

module.exports.request = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const friend = await User.findById(id);

  if (!friend) return next(new _Error('No user found with this Id', 404));

  if (friend.requests.includes(req.user._id)) {
    friend.requests = friend.requests.filter((request) => {
      if (!request.equals(req.user._id)) return request;
    });
  } else {
    friend.requests.push(req.user._id);
  }

  await friend.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: friend,
    message: `Successfully ${
      friend.requests.includes(req.user._id) ? 'cancelled' : 'sent'
    } request`,
  });
});

module.exports.accept = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const friend = await User.findById(id);

  if (!friend) return next(new _Error('No user found with this Id', 404));

  console.log(req.user.requests , id);

  // if (!req.user.requests.includes(req.user._id))
  //   return next(new _Error('You have not received any request from this user', 400));

  req.user.friends.push(id);
  friend.friends.push(req.user._id);

  req.user.requests = req.user.requests.filter((request) => {
    if (!request.equals(id)) return request;
  });

  await req.user.save({ validateBeforeSave: false });
  await friend.save({ validateBeforeSave: false });

  console.log('DONE', res.user, friend);

  res.status(200).json({
    status: 'success',
    data: friend,
    message: `Successfully accepted request`,
  });
});

module.exports.block = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  if (req.user.blocked.includes(id)) {
    req.user.blocked = req.user.blocked.filter((block) => {
      if (!block.equals(id)) return block;
    });
  } else {
    req.user.blocked.push(id);
  }

  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: req.user,
    message: `Successfully ${
      req.user.blocked.includes(id) ? 'blocked' : 'unblocked'
    } user`,
  });
});

module.exports.getRequest = catch_async(async (req, res, next) => {
  console.log('req.user.requests', req.user.requests);
  const requests = await User.find({
    _id: { $in: req.user.requests },
  }).select('name photo email _id');

  res.status(200).json({
    status: 'success',
    data: requests,
    message: `${requests.length} requests found`,
  });
});

module.exports.getFriends = catch_async(async (req, res, next) => {
  const requests = await User.find({
    _id: { $in: req.user.friends },
  }).select('name photo email _id bio');

  res.status(200).json({
    status: 'success',
    data: requests,
    message: `${requests.length} friends found`,
  });
});
