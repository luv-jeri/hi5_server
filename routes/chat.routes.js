const express = require('express');
const { authenticate } = require('../controller/authorization.controller');
const { get_chats, send_message } = require('../controller/chat.controller');

const router = express.Router();

router.use(authenticate);

router.route('/:id').get(get_chats).post(send_message);

module.exports = router;
