const express = require('express');
const { authenticate } = require('../controller/authorization.controller');
const { sendRequest } = require('../controller/friends.controller');
const router = express.Router();

router.use(authenticate);

router.route('/:id').post(sendRequest);

module.exports = router;
