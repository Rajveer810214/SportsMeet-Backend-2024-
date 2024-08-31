const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
const isSuperAdmin = require('../../../middleware/isSuperAdmin');
const studentInfo = require('../../../models/Student');
router.use(express.json());

router.delete('/deleteevent', isSuperAdmin, async (req, res) => {
  try {
    const { jerseyNo, sportId } = req.body;
    // Find the student based on jersey number
    const student = await studentInfo.findOne({ jerseyNo });
    if (!student) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Delete the event registration for the specified user and sport
    const userId = student._id;
    const deletedEvent = await Event.findOneAndDelete({ sportId, userId });
    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found for this user' });
    }
    res.status(200).json({ success: true, message: 'Event registration deleted successfully', deletedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event registration', error: error.message });
  }
});

router.post('/addevent', isSuperAdmin, async (req, res) => {
  try {
    const { jerseyNo, sportIds = [] } = req.body;
    const set = new Set(sportIds);
    if (set.size !== sportIds.length) {
      return res.status(400).json({ success: false, message: 'You cannot select the same events' });
    }
    const student = await studentInfo.find({ jerseyNo: jerseyNo });
    const userId = student[0]._id;
    const existingEvents = await Event.find({ userId, sportId: { $in: sportIds } });
    if (existingEvents.length > 0) {
      return res.status(400).json({ success: false, message: 'You already select this event' });
    }
    // Create new events and save them
    const newEvents = sportIds.map(sportId => new Event({ sportId, userId }));
    const savedEvents = await Promise.all(newEvents.map(event => event.save()));
    res.status(200).json({ message: 'Events added successfully', savedEvents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding events' });
  }
});

module.exports = router;
