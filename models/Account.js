const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  icon: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  total: {
    type: Number,
    default: 0,
  },
});
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
