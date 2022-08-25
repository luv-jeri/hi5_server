const { Schema } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new Schema(
  {
    socket_id: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [20, 'Name must be at most 20 characters'],
    },
    online: {
      type: Boolean,
      default: false,
    },
    push_token: {
      type: String,
    },
    lastSeen: {
      type: Date, //# time and date of last seen
      default: Date.now,
    },
    requests: [
      {
        type: Schema.Types.ObjectId, 
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    blocked: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      index: true,
    },
    username: {
      type: String,
      unique: true,
      index: true,
    },
    photo: {
      type: String,
    },
    OTP: {
      type: Number,
      default: 0,
    },
    OTPExpiry: {
      type: Date,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [3, 'Password must be at least 3 characters'],
      maxlength: [255, 'Password must be at most 255 characters'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Confirm Password is required'],
      minlength: [3, 'Confirm Password must be at least 3 characters'],
      maxlength: [255, 'Confirm Password must be at most 255 characters'],
      validate: {
        validator: function (value) {
          //` this is targeting the document which is getting saved to
          //` value is the "value" of current field i.e. confirmPassword
          return this.password === value;
        },
        message: 'Password and Confirm Password must be the same',
      },
    },
  },
  {
    timestamps: true,
    collection: 'user',
  }
);

userSchema.index({ name: 'text' });
userSchema.index({ username: 'text' });
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = userSchema;
