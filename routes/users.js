const express = require('express');
const { check } = require('express-validator');

const { postUser } = require('../controllers/users');

const router = express.Router();

router.post(
  '/',
  [
    check('email', 'Email is not valid').isEmail(),
    check('password', 'Password is not valid').isLength({ min: 6 }),
  ],
  postUser
);

module.exports = router;
