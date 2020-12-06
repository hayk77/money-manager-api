const express = require('express');
const { check } = require('express-validator');

const { postUser } = require('../controllers/users');

const router = express.Router();

router.post(
  '/',
  [
    check('email', 'Email is not valid').isEmail(),
    check('password')
      .exists()
      .withMessage('Password can not be empty')
      .isLength({ min: 6 })
      .withMessage('Password can not be less than 6 characters'),
  ],
  postUser
);

module.exports = router;
