const { model } = require('mongoose');
const UserSchema = require('../schema/user.schema');
const bcrypt = require('bcryptjs');

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
  }

  next();
});

UserSchema.methods.generateOTP = async function () {
  this.OTP = Math.floor(Math.random() * 1000000);
  this.OTPExpiry = new Date(Date.now() + 1000000);

  await this.save({ validateBeforeSave: false });
};

// UserSchema.post('findById', function (docs) {
//   docs.forEach((doc) => {
//     console.log('Find Middleware', ` ${process.env.APP_URL}/uploads/${doc.photo}`);
//   });
// });

const User = model('user', UserSchema);

module.exports = User;
