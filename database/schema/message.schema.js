const { Schema } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const messageSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [20, 'Name must be at most 20 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    username: {
      type: String,
      unique: true,
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

module.exports = messageSchema;
