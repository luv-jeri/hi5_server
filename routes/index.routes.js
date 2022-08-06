const express = require('express');
const authRouter = require('./authentication.routes');
const userRouter = require('./user.routes');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);

module.exports = router;
