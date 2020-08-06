const express = require('express');
const { check } = require('express-validator');

const { getAuth, postAuth } = require('../controllers/auth');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAuth);

router.post(
  '/',
  [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  postAuth
);

module.exports = router;
