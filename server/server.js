const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/admin', require('./routes/admin'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/timetable")
.then(async () => {
  console.log('MongoDB Connected');
  try {
    // Sync indexes to remove any old, stale unique indexes (like username_1)
    await require('./models/User').syncIndexes();
    console.log('User indexes synced successfully');
  } catch (err) {
    console.log('Error syncing indexes:', err.message);
  }
})
.catch(err => console.log('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
