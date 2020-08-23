const fs = require('fs');
const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

// Load models
const Account = require('./models/Account');
const Category = require('./models/Category');
const Record = require('./models/Record');
const User = require('./models/User');

// Connect to DB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// Read JSON files
const accounts = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/accounts.json`, 'utf-8')
);
const categories = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/categories.json`, 'utf-8')
);
const records = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/records.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Account.create(accounts);
    await Category.create(categories);
    await Record.create(records);
    console.log('Data Imported...');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Account.deleteMany();
    await Category.deleteMany();
    await Record.deleteMany();

    // const user = await User.findById('5f421e47013cbe085ceebd9b');
    // user.accounts = [];
    // user.categories = [];
    // user.records = [];
    // await user.save();

    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-import') {
  importData();
} else if (process.argv[2] === '-destroy') {
  deleteData();
}
