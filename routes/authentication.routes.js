const express = require('express');
 const { whoami } = require('../controller/authorization.controller');
const { signUp, signIn } = require('../controller/authentication.controller');
const router = express.Router();

router.route('/whoami').get(whoami);

router.route('/sign_up').post(signUp);

router.route('/sign_in').post(signIn);

router.route('/forgot_password').post(() => {});

router.route('/reset_password').post(() => {});


module.exports = router;
