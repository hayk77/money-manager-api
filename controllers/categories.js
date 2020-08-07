const { validationResult } = require('express-validator');

const Category = require('../models/Category');
const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getCategories = async (req, res) => {
  const userId = req.user.id;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
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
    const userExists = await dbDocumentChecker.userExists(userId);
    const categoryExists = await dbDocumentChecker.categoryExistsByName(name);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that name already exists' }] });
    }

    const user = await User.findOne({ _id: userId });

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { categoryId } = req.params;
  const { type, icon, name } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(userId);
    const categoryExists = await dbDocumentChecker.categoryExists(categoryId);
    const categoryExistsByName = await dbDocumentChecker.categoryExistsByName(
      name
    );

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    } else if (categoryExistsByName) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that name already exists' }] });
    }

    const category = await Category.findOne({ _id: categoryId });

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
    const userExists = await dbDocumentChecker.userExists(userId);
    const categoryExists = await dbDocumentChecker.categoryExists(categoryId);

    if (!userExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid credentials.' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    }

    const user = await User.findOne({ _id: userId });

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
