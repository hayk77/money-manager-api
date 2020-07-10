const express = require('express');
const { check } = require('express-validator');

const {
  postAccount,
  getAccounts,
  putAccount,
  deleteAccount,
} = require('../controllers/accounts');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', auth, getAccounts);

router.post(
  '/:userId',
  auth,
  [
    check('icon', 'Please choose an icon').exists(),
    check('name', 'Please set the account name').exists(),
  ],
  postAccount
);

router.put('/:userId/:accountId', auth, putAccount);

router.delete('/:userId/:accountId', auth, deleteAccount);

module.exports = router;
