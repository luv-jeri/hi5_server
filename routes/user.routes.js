const express = require('express');
const { getUser } = require('../controller/user.controller');
const { authenticate } = require('../controller/authorization.controller');
const router = express.Router();

router.use(authenticate);

router.route('/').get(getUser);

module.exports = router;
