const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  account: {
    type: mongoose.Schema.ObjectId,
    ref: 'Account',
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});
const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
