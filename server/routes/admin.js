const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const TimetableBlock = require('../models/TimetableBlock');

// Admin authorization middleware
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.isAdmin !== true) {
      return res.status(403).json({ msg: 'Access denied: Admin resources only' });
    }
    next();
  } catch (err) {
    console.error('Admin Auth Error:', err.message);
    res.status(500).json({ error: 'Server error check admin' });
  }
};

// @route   GET api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET api/admin/users/:userId/timetables
// @desc    Get timetables for a specific user (Admin only)
// @access  Private/Admin
router.get('/users/:userId/timetables', [auth, adminAuth], async (req, res) => {
  try {
    const blocks = await TimetableBlock.find({ user: req.params.userId }).sort({ date: -1, start_time: 1 });
    res.json(blocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
