const express = require('express');
const authRouter = require('./authentication.routes');

const router = express.Router();

router.use('/auth', authRouter);

module.exports = router;
