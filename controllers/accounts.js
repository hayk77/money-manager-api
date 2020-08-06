const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const User = require('../models/User');

exports.getAccounts = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = User.findById(userId);
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const userPopulated = await User.findById(userId).populate('accounts');
    const accounts = userPopulated.accounts;

    res.status(200).json(accounts);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
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
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const accountExists = await Account.findOne({ name: name, userId: userId });
    if (accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that name already exist' }] });
    }

    const newAccount = new Account({ userId, icon, name, total });
    await newAccount.save();

    user.accounts.push(newAccount);
    await user.save();

    res.status(201).json(newAccount);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.putAccount = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;
  const { icon, name, total } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(422)
        .json({ msg: 'Account with that id was not found' });
    }

    if (!icon || !name || !total) {
      return res.status(422).json({ msg: 'Please fill in all fields' });
    }

    account.icon = icon;
    account.name = name;
    account.total = total;
    await account.save();

    res.status(200).json(account);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { accountId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(422)
        .json({ msg: 'Account with that id was not found' });
    }

    const indexOfAccount = user.accounts.indexOf(accountId);
    if (indexOfAccount !== -1) user.accounts.splice(indexOfAccount, 1);
    await user.save();

    await Account.findByIdAndRemove(accountId, { useFindAndModify: false });

    res.status(201).json({ msg: 'Account was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};
