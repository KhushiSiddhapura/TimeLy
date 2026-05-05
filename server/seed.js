const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); // Ensure this path matches your User model

// Load environment variables
dotenv.config();

// Connect to the DB using your existing URI from .env
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/timetablemaker";

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully.');

    // 2. Reset Database (Drops all collections securely)
    console.log('Clearing existing database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database cleared.');

    // 3. Prepare Test Users
    console.log('Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword1 = await bcrypt.hash('TestPassword1!', salt);
    const hashedPassword2 = await bcrypt.hash('TestPassword2!', salt);

    const testUsers = [
      {
        name: 'Test User 1',
        email: 'testuser1@example.com',
        password: hashedPassword1
      },
      {
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: hashedPassword2
      }
    ];

    // 4. Insert Users
    console.log('Inserting test users...');
    await User.insertMany(testUsers);
    console.log('Test users seeded successfully!');

    // 5. Exit Process Cleanly
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1); // Exit with failure code
  }
};

// Execute the function
seedDatabase();
