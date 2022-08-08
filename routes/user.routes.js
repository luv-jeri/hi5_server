const express = require('express');
const { getUser , lookup } = require('../controller/user.controller');
const { authenticate } = require('../controller/authorization.controller');
const router = express.Router();

router.use(authenticate);

router.route('/').get(getUser);

router.route('/lookup').get(lookup);

module.exports = router;
