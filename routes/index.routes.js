const express = require('express');
const authRouter = require('./authentication.routes');
const userRouter = require('./user.routes');
const friendRouter = require('./friend.routes');
const chatRouter = require('./chat.routes');
const User = require('../database/models/user.model');
const router = express.Router();
const admin = require('firebase-admin');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/friend', friendRouter);
router.use('/chat', chatRouter);

module.exports = router;
