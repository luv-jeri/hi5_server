const catchAsync = require('../utils/catch_async');
const _Error = require('../utils/_Error');
const Message = require('../database/models/message.model');

module.exports.send_message = catchAsync(async (req, res, next) => {
  const { id } = req.params; //* to
  const { _id } = req.user; //* by
  const { text } = req.body;

  if (!text) return next(new _Error('Please enter a message', 405));

  const new_message = await Message.create({
    to: id,
    by: _id,
    time: new Date(),
    text,
    type: 'text',
  });

  res.status(201).json({
    status: 'success',
    data: new_message,
    message: 'Message sent successfully',
  });
});

module.exports.get_chats = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.user;

  const chats = await Message.find({
    $or: [
      { to: id, by: _id },
      { to: _id, by: id },
    ],
  })
    .limit(20)
    .sort('-time');

  res.status(200).json({
    status: 'success',
    data: chats,
    message: 'Chats fetched successfully',
  });
});
