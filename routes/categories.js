const express = require('express');
const { check } = require('express-validator');

const { postCategory, getCategories } = require('../controllers/categories');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    check('type', 'Please set the category type').exists(),
    check('icon', 'Please set the category icon').exists(),
    check('name', 'Please set the category name').exists(),
  ],
  postCategory
);

router.get('/', auth, getCategories);

module.exports = router;
