const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getAccounts = async (req, res) => {
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // const userPopulated = await User.findById(req.user.id).populate('accounts');
    // const accounts = userPopulated.accounts;

    const accounts = await Account.find({ user: req.user.id });

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

  const { type, name, total } = req.body;
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // dublicate name
    const accountExistsByName = await dbDocumentChecker.accountExistsByName(
      name
    );
    if (accountExistsByName) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that name already exists' }] });
    }

    // const user = await User.findOne({ _id: req.user.id });

    const newAccount = new Account({ type, name, total, user: req.user.id });
    await newAccount.save();

    // user.accounts.push(newAccount);
    // await user.save();

    res.status(201).json(newAccount);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.putAccount = async (req, res) => {
  const { type, name, total } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const accountExists = await dbDocumentChecker.accountExists(
      req.params.accountId
    );

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    }

    // dublicate name
    const accountDublicates = await Account.find({ name: name });
    if (
      accountDublicates.length === 1 &&
      accountDublicates[0]._id.toString() !== req.params.accountId
    ) {
      return res.status(400).json({
        errors: [{ msg: 'Account with that name already exists' }],
      });
    }

    const account = await Account.findOne({ _id: req.params.accountId });

    account.type = type;
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
  const id = req.params.accountId;
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const accountExists = await dbDocumentChecker.accountExists(
      req.params.accountId
    );

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    }

    // const user = await User.findOne({ _id: req.user.id });

    // const indexOfAccount = user.accounts.indexOf(req.params.accountId);
    // if (indexOfAccount !== -1) user.accounts.splice(indexOfAccount, 1);
    // await user.save();

    const account = await Account.findById(req.params.accountId);
    account.remove();

    res.status(201).json({ id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};
