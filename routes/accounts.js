const express = require('express');
const { check } = require('express-validator');

const { postAccount, getAccounts } = require('../controllers/accounts');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    check('icon', 'Please choose an icon').exists(),
    check('name', 'Please set the account name').exists(),
  ],
  postAccount
);

router.get('/', auth, getAccounts);

module.exports = router;
