const { validationResult } = require('express-validator');

const Category = require('../models/Category');

exports.postCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, icon, name } = req.body;

  try {
    const categoryExists = await Category.findOne({ name: name });
    if (categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that name already exist' }] });
    }
    if (type !== 'exences' || type !== 'incomes') {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid category type' }] });
    }

    const newCategory = { type, icon, name };
    const category = new Category(newCategory);
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};
