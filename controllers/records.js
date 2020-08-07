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

    const userPopulated = await User.findById(userId).populate('records');
    const records = userPopulated.records;

    res.status(200).json(records);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
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
    const categoryExistst = await dbDocumentChecker.categoryExistst(categoryId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    } else if (!categoryExistst) {
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

    const record = new Record({ type, account, category, date, amount, note });
    await record.save();

    user.records.push(record);
    await user.save();

    res.status(201).json(record);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
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
    const categoryExistst = await dbDocumentChecker.categoryExistst(categoryId);
    const recordExists = await dbDocumentChecker.recordExists(recordId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    } else if (!categoryExistst) {
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

    // const user = await User.findOne({ _id: userId });
    // if (!user) {
    //   return res.status(400).json({
    //     errors: [
    //       { msg: 'Invalid credentials. Please logout and sign in again' },
    //     ],
    //   });
    // }
    // const account = await Account.findOne({ _id: accountId });
    // if (!account) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    // }
    // const category = await Category.findOne({ _id: categoryId });
    // if (!category) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    // }
    // if (!record) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'Record with that id does not exist' }] });
    // }

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
    res.status(500).send('Server error');
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

    // const user = await User.findOne({ _id: userId });
    // if (!user) {
    //   return res.status(400).json({
    //     errors: [
    //       { msg: 'Invalid credentials. Please logout and sign in again' },
    //     ],
    //   });
    // }
    // const record = await Record.findOne({ _id: recordId });
    // if (!record) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'Record with that id does not exist' }] });
    // }
    // const account = await Account.findOne({ _id: record.account._id });
    // if (!account) {
    //   return res
    //     .status(400)
    //     .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    // }

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
    res.status(500).send('Server error');
  }
};
