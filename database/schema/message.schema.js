const { Schema } = require('mongoose');

const messageSchema = new Schema(
  {
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    time: {
      type: Date,
      default: new Date(),
    },
    type: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'message',
  }
);

messageSchema.index({
  to: 1,
  by: 1,
});

module.exports = messageSchema;
