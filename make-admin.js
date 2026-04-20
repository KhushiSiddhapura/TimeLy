const mongoose = require('mongoose');
require('dotenv').config({ path: './server/.env' });

const User = require('./server/models/User');

const email = process.argv[2];
if (!email) {
  console.log('Usage: node make-admin.js user@example.com');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/timetable";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to Database');
    const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
    if (user) {
      console.log(`Success! ${email} is now an admin.`);
    } else {
      console.log(`Error: User with email ${email} not found.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
