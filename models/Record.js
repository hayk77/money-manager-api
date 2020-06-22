const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  note: {
    type: String,
  },
});
const Record = mongoose.model('record', recordSchema);

module.exports = Record;
