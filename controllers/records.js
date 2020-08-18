const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');
const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getRecords = async (req, res) => {
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    }

    const reqQuery = { ...req.query, user: userId };
    // const removeFields = ['date'];
    // removeFields.forEach((param) => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gte|lte)\b/g, (match) => `$${match}`);
    queryStr.user = userId;

    const records = await Record.find(JSON.parse(queryStr)).sort('-date');
    const userPopulated = await User.findById(userId).populate('categories');
    const categories = userPopulated.categories;

    let incomes = 0;
    const cashflow = [];
    let expences = 0;
    records.forEach((record) => {
      // create monthly expences and incomes
      if (record.type === 'expences') {
        expences += record.amount;
      } else if (record.type === 'incomes') {
        cashflow.push(record);
        incomes += record.amount;
      }
    });

    // create monthly records by categories
    const recordsByCategories = categories.map((category) => {
      const { _id, type, icon, name } = category;
      let total = 0;

      records.forEach((record) => {
        if (category._id.toString() === record.category.toString()) {
          total += record.amount;
        }
      });

      return { _id, type, icon, name, total };
    });

    res.status(200).json({
      records,
      incomes,
      expences,
      recordsByCategories,
      cashflow,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.getMonthlyRecords = async (req, res) => {
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    }

    const userPopulated = await User.findById(userId)
      .populate('records')
      .populate('categories');
    const records = userPopulated.records;
    const categories = userPopulated.categories;

    const d = new Date();
    const month = d.getMonth();
    const year = d.getFullYear();

    const monthlyRecords = [];
    let monthlyIncomes = 0;
    let monthlyExpences = 0;
    records.forEach((record) => {
      if (
        record.date < new Date() &&
        record.date > new Date(year + ',' + month)
      ) {
        // create monthly records array
        monthlyRecords.push(record);
        // create monthly expences and incomes
        if (record.type === 'expences') {
          monthlyExpences += record.amount;
        } else if (record.type === 'incomes') {
          monthlyIncomes += record.amount;
        }
      }
    });

    // create monthly records by categories
    const monthlyRecordsByCategories = categories.map((category) => {
      const { _id, type, icon, name } = category;
      let total = 0;

      records.forEach((record) => {
        if (category._id.toString() === record.category.toString()) {
          total += record.amount;
        }
      });

      return { _id, type, icon, name, total };
    });

    res.status(200).json({
      monthlyRecords,
      monthlyIncomes,
      monthlyExpences,
      monthlyRecordsByCategories,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.postRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, accountId, categoryId, date, amount, note } = req.body;
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const accountExists = await dbDocumentChecker.accountExists(accountId);
    const categoryExists = await dbDocumentChecker.categoryExists(categoryId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    }

    const user = await User.findOne({ _id: userId });
    const account = await Account.findOne({ _id: accountId });
    const category = await Category.findOne({ _id: categoryId });

    // update account total
    if (type === 'expences') {
      account.total -= Number(amount);
    } else if (type === 'incomes') {
      account.total += Number(amount);
    }
    await account.save();

    const record = new Record({
      type,
      account,
      category,
      date,
      amount,
      note,
      user: userId,
    });
    await record.save();

    user.records.push(record);
    await user.save();

    res.status(201).json(record);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.putRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, accountId, categoryId, date, amount, note } = req.body;
  const userId = req.user.id;
  const { recordId } = req.params;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const accountExists = await dbDocumentChecker.accountExists(accountId);
    const categoryExists = await dbDocumentChecker.categoryExists(categoryId);
    const recordExists = await dbDocumentChecker.recordExists(recordId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    } else if (!recordExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Record with that id does not exist' }] });
    }

    const user = await User.findOne({ _id: userId });
    const account = await Account.findOne({ _id: accountId });
    const category = await Category.findOne({ _id: categoryId });
    const record = await Record.findOne({ _id: recordId });

    // update accounts total
    if (record.type === 'expences' && type === 'expences') {
      account.total += Number(record.amount);
      account.total -= Number(amount);
    } else if (record.type === 'expences' && type === 'incomes') {
      account.total += Number(record.amount);
      account.total += Number(amount);
    } else if (record.type === 'incomes' && type === 'incomes') {
      account.total -= Number(record.amount);
      account.total += Number(amount);
    } else if (record.type === 'incomes' && type === 'expences') {
      account.total -= Number(record.amount);
      account.total -= Number(amount);
    }
    await account.save();

    record.type = type;
    record.account = account;
    record.category = category;
    record.date = date;
    record.amount = amount;
    record.note = note;
    await record.save();

    res.status(201).json(record);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.deleteRecord = async (req, res) => {
  const userId = req.user.id;
  const { recordId } = req.params;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const recordExists = await dbDocumentChecker.recordExists(recordId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!recordExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Record with that id does not exist' }] });
    }

    const user = await User.findOne({ _id: userId });
    const record = await Record.findOne({ _id: recordId });
    const account = await Account.findOne({ _id: record.account._id });

    if (record.type === 'expences') {
      account.total += record.amount;
    } else {
      account.total -= record.amount;
    }
    await account.save();

    const indexOfRecord = user.records.indexOf(recordId);
    if (indexOfRecord !== -1) user.records.splice(indexOfRecord, 1);
    await user.save();

    await Record.findByIdAndRemove(recordId, { useFindAndModify: false });

    res.status(201).json({ msg: 'Record was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};
