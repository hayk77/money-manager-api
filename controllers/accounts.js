const { validationResult } = require('express-validator');

const Account = require('../models/Account');

exports.postAccount = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { icon, name, total } = req.body;

  try {
    const accountExists = await Account.findOne({ name: name });
    if (accountExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that name already exist' }] });
    }
    const newAccount = { icon, name, total };
    const account = new Account(newAccount);
    await account.save();

    res.status(201).json(account);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json(accounts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};
