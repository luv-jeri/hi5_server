const express = require('express');
const { authenticate } = require('../controller/authorization.controller');
const {
  request,
  accept,
  block,
  getRequest,
  getFriends,
} = require('../controller/friends.controller');
const router = express.Router();

router.use(authenticate);

router.route('/accept/:id').get(accept);
router.route('/request').get(getRequest)
router.route('/friends').get(getFriends);
router.route('/:id').post(request);
router.route('/block/:id').post(block);

module.exports = router;
