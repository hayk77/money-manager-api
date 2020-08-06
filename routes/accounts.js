const express = require('express');
const { check } = require('express-validator');

const {
  getAccounts,
  postAccount,
  putAccount,
  deleteAccount,
} = require('../controllers/accounts');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAccounts);

router.post(
  '/',
  auth,
  [
    check('icon', 'Please choose an icon').exists(),
    check('name', 'Please set the account name').exists(),
    check('total', 'Please set the total').exists(),
  ],
  postAccount
);

router.put(
  '/:accountId',
  auth,
  [
    check('icon', 'Please choose an icon').exists(),
    check('name', 'Please set the account name').exists(),
    check('total', 'Please set the total').exists(),
  ],
  putAccount
);

router.delete('/:accountId', auth, deleteAccount);

module.exports = router;
