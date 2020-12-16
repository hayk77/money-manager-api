const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User');

// GET(public) /auth
exports.getAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

// POST(public) /auth
exports.postAuth = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      config.get('jwtSecret'),
      // { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: 'Server Error' }] });
  }
};

// PUT(private) /auth/email
exports.putEmail = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let user = await User.find({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: 'User with that id does not exist' });
    }

    // dublicate name
    const emialDublicates = await User.find({ email: req.body.email });
    if (
      emialDublicates.length === 1 &&
      emialDublicates[0]._id.toString() !== req.user.id
    ) {
      return res.status(400).json({
        errors: [{ msg: 'User with that email already exists' }],
      });
    }

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { email: req.body.email },
      { useFindAndModify: false }
    );

    return res.status(201).json({ msg: 'Updated email' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};

// PUT(private) /auth/password
exports.putPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({ msg: 'User with that id does not exist' });
    }

    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ errors: [{ msg: 'Old password is not correct' }] });
    }

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(req.body.password, salt);
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { password: newPassword },
      { useFindAndModify: false }
    );

    return res.status(201).json({ msg: 'Updated password' });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};
