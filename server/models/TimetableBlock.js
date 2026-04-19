const mongoose = require('mongoose');

const TimetableBlockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // Storing as 'YYYY-MM-DD' for simplicity
    required: true
  },
  start_time: {
    type: String, // 'HH:mm'
    required: true
  },
  end_time: {
    type: String, // 'HH:mm'
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String, // e.g., 'Work', 'Study', 'Personal', 'Break'
    default: 'Personal'
  },
  priority: {
    type: String, // e.g., 'High', 'Medium', 'Low'
    default: 'Medium'
  },
  notes: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number, // In case of custom reordering within overlaps/same day
    default: 0
  }
});

module.exports = mongoose.model('TimetableBlock', TimetableBlockSchema);
