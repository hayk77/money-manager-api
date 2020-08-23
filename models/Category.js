const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

categorySchema.pre('remove', async function (next) {
  await this.model('Record').deleteMany({ category: this._id });
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
