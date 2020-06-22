const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
const Account = mongoose.model('account', accountSchema);

module.exports = Account;
