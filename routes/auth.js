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
    check('password', 'Password is required').exists(),
  ],
  postAuth
);
// PUT (private) /auth/email
router.put('/email', auth, putEmail);
// PUT (private) /auth/email
router.put('/password', auth, putPassword);

module.exports = router;
