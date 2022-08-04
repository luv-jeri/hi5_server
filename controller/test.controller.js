const catchAsync = require('../utils/catch_async');
const _Error = require('../utils/_Error');
const Tour = require('../database/Schema/tours.schema');
const Review = require('../database/Schema/review.schema');
const User = require('../database/Schema/user.schema');

const mongoose = require('mongoose');

module.exports.test = async (req, res, next) => {
  const { id } = req.params;
  const { review } = req.body;

  const s = await mongoose.startSession(); // # session

  s.startTransaction(); // # start transaction

  try {
    // const review_ = await Review.create(
    //   [
    //     {
    //       tour: id,
    //       review,
    //       tourist: req.user._id,
    //     },
    //   ],
    //   {
    //     session: s,
    //   }
    // );

    const review_ = new Review({
      tour: id,
      review,
      tourist: req.user._id,
    });

    await review_.save({ session: s });

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          reviews: review_._id,
        },
      },
      {
        session: s,
      }
    );

    res.status(201).json({
      status: 'success',
      data: review_,
      message: 'Review created successfully',
    });

    await s.commitTransaction();
  } catch (err) {
    await s.abortTransaction();
    next(new _Error(err.message, 500));
  }
};
