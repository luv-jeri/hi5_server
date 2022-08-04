const _Error = require('../utils/_Error');

module.exports.restrictTo = (role) => {
  return (req, res, next) => {
    if (role.includes(req.user.role)) next();
    else return next(new _Error('You are not authorized to perform this action', 401));
  };
};
