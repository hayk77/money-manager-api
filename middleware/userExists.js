const User = require('../models/User');

module.exports = async (userId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(400).json({
      errors: [{ msg: 'Invalid credentials. Please logout and sign in again' }],
    });
  }
};
