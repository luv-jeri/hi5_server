const _Error = require('../utils/_Error');
const User = require('../database/models/user.model');
const catch_async = require('../utils/catch_async');
const mongoose = require('mongoose');
// # axios.post('/friends/6dt45308b)

module.exports.sendRequest = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const session = await mongoose.startSession();

  // const friend = await User.findByIdAndUpdate(id, {
  //   $pull: {
  //     requests: req.user._id,
  //   },
  //   // $push: {
  //   //   requests_sent: req.user._id,
  //   // }
  // });

  try {
    session.startTransaction();

    const to_be_requested = await User.findOne({
      _id: id,
      requests: { $ne: req.user._id },
    }); //* looking for the person to be requested using "id"

    console.log('To be sent request', to_be_requested);

    // if (to_be_requested.requests.includes(req.user._id)) {
    //   await session.abortTransaction();
    //   return next(new _Error('You have already sent request to this person', 400));
    // }

    if (!to_be_requested)
      return next(new _Error('No person found with this ID 😔 ', 404));

    to_be_requested.requests.push(req.user._id); // * adding the current user id to the requests array of the person to be requested

    console.log('Current User', req.user);

    await to_be_requested.save({ session, validateBeforeSave: false }); // * saving the person to be requested

    req.user.requested.push(id); // * adding the id of the person to be requested to the requested array of the current user

    await req.user.save({ session, validateBeforeSave: false });

    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: to_be_requested,
      message: `You have sent a request to ${to_be_requested.name} 🥰`,
    });
  } catch (e) {
    console.log(e);
    await session.abortTransaction();

    return next(new _Error('Something went wrong 😔', 500));
  }

  await session.endSession();
});

// #
module.exports.cancelRequest = catch_async(async (req, res, next) => {
  const { id } = req.params; // * Id of the person, to which request is going to be sent

  if (!id) return next(new _Error('Please provide Id of the pearson', 400));

  const session = await mongoose.startSession();

  // const friend = await User.findByIdAndUpdate(id, {
  //   $pull: {
  //     requests: req.user._id,
  //   },
  //   // $push: {
  //   //   requests_sent: req.user._id,
  //   // }
  // });

  try {
    session.startTransaction();

    const to_be_requested = await User.findOne({
      _id: id,
      requests: { $ne: req.user._id },
    }); //* looking for the person to be requested using "id"

    console.log('To be sent request', to_be_requested);

    // if (to_be_requested.requests.includes(req.user._id)) {
    //   await session.abortTransaction();
    //   return next(new _Error('You have already sent request to this person', 400));
    // }

    if (!to_be_requested)
      return next(new _Error('No person found with this ID 😔 ', 404));

    to_be_requested.requests.push(req.user._id); // * adding the current user id to the requests array of the person to be requested

    console.log('Current User', req.user);

    await to_be_requested.save({ session, validateBeforeSave: false }); // * saving the person to be requested

    req.user.requested.push(id); // * adding the id of the person to be requested to the requested array of the current user

    await req.user.save({ session, validateBeforeSave: false });

    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: to_be_requested,
      message: `You have sent a request to ${to_be_requested.name} 🥰`,
    });
  } catch (e) {
    console.log(e);
    await session.abortTransaction();

    return next(new _Error('Something went wrong 😔', 500));
  }

  await session.endSession();
});

// const to_be_requested = await User.findOne({
//       _id: id,
//       requests: { $ne: req.user._id },
//     }); //* looking for the person to be requested using "id"
