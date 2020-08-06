const express = require('express');
const { check } = require('express-validator');

const {
  getRecords,
  postRecord,
  putRecord,
  deleteRecord,
} = require('../controllers/records');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getRecords);

router.post(
  '/',
  auth,
  // [
  //   check('type', 'Please set the record type').exists(),
  //   check('accountId', 'Please set the account').exists(),
  //   check('categoryId', 'Please set the category').exists(),
  //   check('date', 'Please set the date').exists(),
  //   check('amount', 'Please set the amount').exists(),
  // ],
  postRecord
);

router.put(
  '/:recordId',
  auth,
  [
    check('type', 'Please set the record type').exists(),
    check('accountId', 'Please set the account').exists(),
    check('categoryId', 'Please set the category').exists(),
    check('date', 'Please set the date').exists(),
    check('amount', 'Please set the amount').exists(),
  ],
  putRecord
);

router.delete('/:recordId', auth, deleteRecord);

module.exports = router;
