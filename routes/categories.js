const express = require('express');
const { check } = require('express-validator');

const {
  postCategory,
  getCategories,
  putCategory,
  deleteCategory,
} = require('../controllers/categories');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getCategories);

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

router.put(
  '/:categoryId',
  auth,
  [
    check('type', 'Please set the category type').exists(),
    check('icon', 'Please set the category icon').exists(),
    check('name', 'Please set the category name').exists(),
  ],
  putCategory
);

router.delete('/:categoryId', auth, deleteCategory);

module.exports = router;
