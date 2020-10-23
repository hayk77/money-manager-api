const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Conntected to the database');
  } catch (err) {
    console.log(err.message);
    process.exit(`1`);
  }
};

module.exports = connectDB;
