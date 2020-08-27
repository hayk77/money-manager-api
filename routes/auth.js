const express = require('express');
const { check } = require('express-validator');

const {
  getAuth,
  postAuth,
  putEmail,
  putPassword,
} = require('../controllers/auth');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /auth
router.get('/', auth, getAuth);
// POST /auth
router.post(
  '/',
  [
    check('email', 'Email is not valid').isEmail(),
    check('password')
      .exists()
      .withMessage('Password can not be empty')
      .isLength({ min: 6 })
      .withMessage('Password can not be less than 6 character'),
  ],
  postAuth
);
// PUT (private) /auth/email
router.put(
  '/email',
  auth,
  [check('email', 'Email is not valid').exists().isEmail()],
  putEmail
);
// PUT (private) /auth/email
router.put(
  '/password',
  auth,
  [
    check('password')
      .exists()
      .withMessage('Password can not be empty')
      .isLength({ min: 6 })
      .withMessage('Password can not be less than 6 character'),
  ],
  putPassword
);

module.exports = router;
