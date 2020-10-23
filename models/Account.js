const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

accountSchema.pre('remove', async function (next) {
  await this.model('Record').deleteMany({ account: this._id });
  next();
});

const Account = mongoose.model('Account', accountSchema);
module.exports = Account;
