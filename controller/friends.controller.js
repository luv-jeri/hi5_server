const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');

// # axios.post('/friends/6dt45308b)

module.exports.request = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const friend = await User.findById(id);
  if (!friend) return next(new _Error('No user found with this id', 404));

  if (friend.friends.includes(req.user._id))
    return next(new _Error('You are already friends', 400));

  if (friend.blocked.includes(req.user._id))
    return next(new _Error('You are blocked by this user', 400));

  if (friend.requests.includes(req.user._id)) friend.requests.pull(req.user._id);
  else friend.requests.push(req.user._id);

  await friend.save({ validateBeforeSave: false });

  if (!friend) return next(new _Error('No user found with this Id', 404));

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
  const user = await User.findById(req.user._id);

  if (!friend) return next(new _Error('No user found with this Id', 404));
  if (!friend.requests.includes(user._id))
    return next(new _Error('You have not received any request', 400));
  if (friend.friends.includes(req.user._id))
    return next(new _Error('You are already friends', 400));
  if (req.user.friends.includes(req.user._id))
    return next(new _Error('You are already friends', 400));

  friend.friends.push(req.user._id);
  friend.requests.pull(req.user._id);
  user.friends.push(friend._id);

  await user.save({ validateBeforeSave: false });
  await friend.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: friend,
    message: `Successfully accepted request`,
  });
});

module.exports.block = catch_async(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const user = await User.findById(req.user._id);

  if (user.friends.includes(id)) user.friends.pull(id);
  if (user.requests.includes(id)) user.requests.pull(id);

  user.blocked.push(id);

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
