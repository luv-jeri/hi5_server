const express = require('express');
const { getUser, lookup, updateUser } = require('../controller/user.controller');
const { authenticate } = require('../controller/authorization.controller');
const router = express.Router();

router.use(authenticate);

router.route('/').get(getUser).patch(updateUser);

router.route('/lookup').get(lookup);

module.exports = router;
