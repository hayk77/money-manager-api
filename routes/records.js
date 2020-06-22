const express = require('express');
const { check } = require('express-validator');

const { postRecord } = require('../controllers/records');
const auth = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  auth,
  [
    check('type', 'Please set the record type').exists(),
    check('accountId', 'Please set the account').exists(),
    check('categoryId', 'Please set the category').exists(),
    check('date', 'Please set the date').exists(),
    check('amount', 'Please set the amount').exists(),
  ],
  postRecord
);

module.exports = router;
