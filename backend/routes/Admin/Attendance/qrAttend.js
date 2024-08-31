const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
const isAdmin = require('../../../middleware/isAdmin')
const studentInfo = require('../../../models/Student');
router.use(express.json());

router.post('/update', isAdmin, async (req, res) => {
  try {
    const { sportId, jerseyNo, status } = req.body;
    // Find the user by jersey number
    const user = await studentInfo.findOne({ jerseyNo: jerseyNo });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedEvent = await Event.findOneAndUpdate(
      { sportId: sportId, userId: user._id },
      { attendance: status },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found or user not registered for the event' });
    }
    res.status(200).json({ message: 'Attendance updated successfully', updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance' });
  }
});

module.exports = router;
