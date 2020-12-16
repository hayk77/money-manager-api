const { validationResult } = require('express-validator');

const Category = require('../models/Category');
// const User = require('../models/User');
const dbDocumentChecker = require('../helpers/db-document-checker');

exports.getCategories = async (req, res) => {
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // const userPopulated = await User.findById(userId).populate('categories');
    // const categories = userPopulated.categories;

    const categories = await Category.find({ user: req.user.id });

    res.status(200).json(categories);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.postCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, icon, name } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // dublicate name
    const categoryExistsByName = await dbDocumentChecker.categoryExistsByName(
      name
    );
    if (categoryExistsByName) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that name already exists' }] });
    }

    // const user = await User.findOne({ _id: req.user.id });

    if (type !== 'expences' && type !== 'incomes') {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Invalid category type' }] });
    }

    const newCategory = new Category({ type, icon, name, user: req.user.id });
    await newCategory.save();

    // user.categories.push(newCategory);
    // await user.save();

    res.status(201).json(newCategory);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.putCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, icon, name } = req.body;

  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const categoryExists = await dbDocumentChecker.categoryExists(
      req.params.categoryId
    );

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    }

    // dublicate name
    const categoryDublicates = await Category.find({ name: name });
    if (
      categoryDublicates.length === 1 &&
      categoryDublicates[0]._id.toString() !== req.params.categoryId
    ) {
      return res.status(400).json({
        errors: [{ msg: 'Category with that name already exists' }],
      });
    }

    const category = await Category.findOne({ _id: req.params.categoryId });

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
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const userExists = await dbDocumentChecker.userExists(req.user.id);
    const categoryExists = await dbDocumentChecker.categoryExists(
      req.params.categoryId
    );

    if (!userExists) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    } else if (!categoryExists) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Category with that id does not exist' }] });
    }

    // const user = await User.findOne({ _id: req.user.id });

    // const indexOfCategory = user.categories.indexOf(req.params.categoryId);
    // if (indexOfCategory !== -1) user.categories.splice(indexOfCategory, 1);
    // await user.save();

    const category = await Category.findById(req.params.categoryId);
    category.remove();

    res.status(201).json({ msg: 'Category was removed' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};
