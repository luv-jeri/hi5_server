const express = require('express');
const authRouter = require('./authentication.routes');
const userRouter = require('./user.routes');
const friendRouter = require('./friend.routes');
const User = require('../database/models/user.model');
const router = express.Router();
const admin = require('firebase-admin');

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/friend', friendRouter);
router.use('/test', async (req, res) => {
  const { id } = req.query;

  const to = await User.findById(id);
  console.log('test', to);

  try {
    admin.messaging().sendToDevice([to.push_token], {
      notification: {
        title: 'Test',
        body: 'Test MESSAGE',
      },
    });
    console.log('send')
  } catch (e) {
    console.log(e);
  }

  res.send('ok');
});

module.exports = router;
