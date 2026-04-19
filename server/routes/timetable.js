const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TimetableBlock = require('../models/TimetableBlock');

// @route   GET api/timetable
// @desc    Get all timetable blocks for a specific user and date
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query; // Expecting date as YYYY-MM-DD
    
    let query = { user: req.user.id };
    if (date) {
      query.date = date;
    }

    const blocks = await TimetableBlock.find(query).sort({ start_time: 1 });
    res.json(blocks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/timetable
// @desc    Create a new time block
// @access  Private
router.post('/', auth, async (req, res) => {
  const { date, start_time, end_time, title, category, priority, notes } = req.body;

  try {
    // Basic overlap validation logic omitted for brevity but can be added here
    // e.g. check if there's any block for this user and date where start_time < new_end_time AND end_time > new_start_time

    const newBlock = new TimetableBlock({
      user: req.user.id,
      date,
      start_time,
      end_time,
      title,
      category,
      priority,
      notes
    });

    const block = await newBlock.save();
    res.json(block);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/timetable/:id
// @desc    Update a time block
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { date, start_time, end_time, title, category, priority, notes, completed, order } = req.body;

  const blockFields = {};
  if (date) blockFields.date = date;
  if (start_time) blockFields.start_time = start_time;
  if (end_time) blockFields.end_time = end_time;
  if (title) blockFields.title = title;
  if (category) blockFields.category = category;
  if (priority) blockFields.priority = priority;
  if (notes) blockFields.notes = notes;
  if (completed !== undefined) blockFields.completed = completed;
  if (order !== undefined) blockFields.order = order;

  try {
    let block = await TimetableBlock.findById(req.params.id);

    if (!block) return res.status(404).json({ msg: 'Block not found' });

    // Make sure user owns block
    if (block.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    block = await TimetableBlock.findByIdAndUpdate(
      req.params.id,
      { $set: blockFields },
      { new: true }
    );

    res.json(block);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/timetable/:id
// @desc    Delete a time block
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const block = await TimetableBlock.findById(req.params.id);

    if (!block) return res.status(404).json({ msg: 'Block not found' });

    // Make sure user owns block
    if (block.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await TimetableBlock.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Block removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/timetable/reorder/batch
// @desc    Update order of multiple blocks (for drag and drop)
// @access  Private
router.put('/reorder/batch', auth, async (req, res) => {
  const { blocks } = req.body; // Array of { id, order, start_time, end_time }
  
  if (!blocks || !Array.isArray(blocks)) {
    return res.status(400).json({ msg: 'Invalid payload' });
  }

  try {
    // Ideally use bulkWrite for better performance
    const bulkOps = blocks.map(b => ({
      updateOne: {
        filter: { _id: b.id, user: req.user.id },
        update: { $set: { order: b.order, start_time: b.start_time, end_time: b.end_time } }
      }
    }));

    await TimetableBlock.collection.bulkWrite(bulkOps);
    res.json({ msg: 'Blocks reordered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

module.exports = router;
