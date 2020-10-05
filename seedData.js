const fs = require('fs');

// Load models
const Account = require('./models/Account');
const Category = require('./models/Category');

module.exports = seedData = async (userId) => {
  try {
    // Read JSON files
    const accounts = JSON.parse(
      fs.readFileSync(`${__dirname}/_data_new_user/accounts.json`, 'utf-8')
    );
    const categories = JSON.parse(
      fs.readFileSync(`${__dirname}/_data_new_user/categories.json`, 'utf-8')
    );

    accounts.map((account) => {
      account.user = userId;
    });
    categories.map((category) => {
      category.user = userId;
    });

    await Account.create(accounts);
    await Category.create(categories);
    console.log('Data Imported...');
  } catch (err) {
    console.log(err);
  }
};
