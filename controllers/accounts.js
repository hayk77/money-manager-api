const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getAccounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    }

    const userPopulated = await User.findById(userId).populate('accounts');
    const accounts = userPopulated.accounts;

    res.status(200).json(accounts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.postAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { icon, name, total } = req.body;
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const user = await User.findOne({ _id: userId });

    const newAccount = new Account({ userId, icon, name, total });
    await newAccount.save();

    user.accounts.push(newAccount);
    await user.save();

    res.status(201).json(newAccount);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.putAccount = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;
  const { icon, name, total } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const accountExists = await dbDocumentChecker.accountExists(accountId);

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    }

    const account = await Account.findOne({ _id: accountId });

    account.icon = icon;
    account.name = name;
    account.total = total;
    await account.save();

    res.status(200).json(account);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const accountExists = await dbDocumentChecker.accountExists(accountId);

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    }

    const user = await User.findOne({ _id: userId });
    const account = await Account.findOne({ _id: accountId });

    const indexOfAccount = user.accounts.indexOf(accountId);
    if (indexOfAccount !== -1) user.accounts.splice(indexOfAccount, 1);
    await user.save();

    await Account.findByIdAndRemove(accountId, { useFindAndModify: false });

    res.status(201).json({ msg: 'Account was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};
