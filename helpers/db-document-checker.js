const mongoose = require('mongoose');

const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');
const User = require('../models/User');
module.exports = (() => {
  console.log('checking for user');

  const _userExists = async (userId) => {
    if (mongoose.Types.ObjectId.isValid(userId) === false) {
      return false;
    } else {
      const user = await User.findOne({ _id: userId });
      if (!user) {
        return false;
      }
      return true;
    }
  };

  const _accountExists = async (accountId) => {
    if (mongoose.Types.ObjectId.isValid(accountId) === false) {
      return false;
    } else {
      const account = await Account.findOne({ _id: accountId });
      if (!account) {
        return false;
      }
      return true;
    }
  };

  const _categoryExists = async (categoryId) => {
    if (mongoose.Types.ObjectId.isValid(categoryId) === false) {
      return false;
    } else {
      const category = await Category.findOne({ _id: categoryId });
      if (!category) {
        return false;
      }
      return true;
    }
  };

  const _categoryExistsByName = async (name) => {
    const category = await Category.findOne({ name: name });
    if (!category) {
      return false;
    }
    return true;
  };

  const _recordExists = async (recordId) => {
    if (mongoose.Types.ObjectId.isValid(recordId) === false) {
      return false;
    } else {
      const record = await Record.findOne({ _id: recordId });
      if (!record) {
        return false;
      }
      return true;
    }
  };

  return {
    userExists: _userExists,
    accountExists: _accountExists,
    categoryExists: _categoryExists,
    categoryExistsByName: _categoryExistsByName,
    recordExists: _recordExists,
  };
})();