const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');
const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getRecords = async (req, res) => {
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    }

    const reqQuery = { ...req.query, user: req.user.id };
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gte|lte)\b/g, (match) => `$${match}`);
    queryStr.user = req.user.id;

    const records = await Record.find(JSON.parse(queryStr)).sort('date');
    const categories = await Category.find({ user: req.user.id });
    // const userPopulated = await User.findById(req.user.id).populate('categories');
    // const categories = userPopulated.categories;

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
      count: records.length,
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

exports.postRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, accountId, categoryId, date, amount, note } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
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

    // const user = await User.findOne({ _id: req.user.id });
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
      user: req.user.id,
    });
    await record.save();

    // user.records.push(record);
    // await user.save();

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

  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const accountExists = await dbDocumentChecker.accountExists(accountId);
    const categoryExists = await dbDocumentChecker.categoryExists(categoryId);
    const recordExists = await dbDocumentChecker.recordExists(
      req.params.recordId
    );

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

    // const user = await User.findOne({ _id: req.user.id });
    const account = await Account.findOne({ _id: accountId });
    const category = await Category.findOne({ _id: categoryId });
    const record = await Record.findOne({ _id: req.params.recordId });

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
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const recordExists = await dbDocumentChecker.recordExists(
      req.params.recordId
    );

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!recordExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Record with that id does not exist' }] });
    }

    // const user = await User.findOne({ _id: req.user.id });
    const record = await Record.findOne({ _id: req.params.recordId });
    const account = await Account.findOne({ _id: record.account._id });

    if (record.type === 'expences') {
      account.total += record.amount;
    } else {
      account.total -= record.amount;
    }
    await account.save();

    // const indexOfRecord = user.records.indexOf(req.params.recordId);
    // if (indexOfRecord !== -1) user.records.splice(indexOfRecord, 1);
    // await user.save();

    await Record.findByIdAndRemove(req.params.recordId, {
      useFindAndModify: false,
    });

    res.status(201).json({ msg: 'Record was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};
