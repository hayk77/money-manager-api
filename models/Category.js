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
    unique: true,
  },
});
const Category = mongoose.model('category', categorySchema);

module.exports = Category;
