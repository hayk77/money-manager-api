const { validationResult } = require('express-validator');

const Category = require('../models/Category');
const User = require('../models/User');

exports.getCategories = async (req, res) => {
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

    const userPopulated = await User.findById(userId).populate('categories');
    const categories = userPopulated.categories;

    res.status(200).json(categories);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server error');
  }
};

exports.postCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, icon, name } = req.body;
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

    const categoryExists = await Category.findOne({ name: name });
    if (categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that name already exist' }] });
    }

    if (type !== 'expences' && type !== 'incomes') {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid category type' }] });
    }

    const newCategory = new Category({ type, icon, name });
    await newCategory.save();

    user.categories.push(newCategory);
    await user.save();

    res.status(201).json(newCategory);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.putCategory = async (req, res) => {
  const userId = req.user.id;
  const { categoryId } = req.params;
  const { type, icon, name } = req.body;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(422)
        .json({ msg: 'Category with that id was not found' });
    }

    if (!type || !icon || !name) {
      return res.status(422).json({ msg: 'Please fill in all fields' });
    }

    if (type !== 'expences' && type !== 'incomes') {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid category type' }] });
    }

    category.type = type;
    category.icon = icon;
    category.name = name;
    await category.save();

    res.status(200).json(category);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

exports.deleteCategory = async (req, res) => {
  const userId = req.user.id;
  const { categoryId } = req.params;

  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(400).json({
        errors: [
          { msg: 'Invalid credentials. Please logout and sign in again' },
        ],
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(422)
        .json({ msg: 'Category with that id was not found' });
    }

    const indexOfCategory = user.categories.indexOf(categoryId);
    if (indexOfCategory !== -1) user.categories.splice(indexOfCategory, 1);
    await user.save();

    await Category.findByIdAndRemove(categoryId, { useFindAndModify: false });

    res.status(201).json({ msg: 'Category was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};
