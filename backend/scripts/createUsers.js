const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/user');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = [
      { username: 'user1', password: '1234' },
      { username: 'user2', password: '1234' },
      { username: 'user3', password: '1234' },
      { username: 'user4', password: '1234' },
      { username: 'user5', password: '1234' },
      { username: 'user6', password: '1234' },
    ];

    await User.insertMany(users);
    console.log('Users inserted');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
