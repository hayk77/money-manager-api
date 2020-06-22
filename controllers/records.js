const { validationResult } = require('express-validator');

const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');

exports.postRecord = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, accountId, categoryId, date, amount, note } = req.body;

  try {
    const account = await Account.findOne({ _id: accountId });
    if (!account) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Account with that id does not exist' }] });
    }
    const category = await Category.findOne({ _id: categoryId });
    if (!category) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    }

    type === 'expence' ? (account.total -= amount) : (account.total += amount);
    await account.save();

    const newRecord = { type, account, category, date, amount, note };
    const record = new Record(newRecord);
    await record.save();

    res.status(201).json(record);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};
