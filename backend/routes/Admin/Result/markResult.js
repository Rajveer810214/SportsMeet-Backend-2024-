const express = require('express');
const router = express.Router();
const isAdmin = require('../../../middleware/isAdmin')
const Event = require('../../../models/Event');
const isSuperAdmin = require('../../../middleware/isSuperAdmin')
const studentInfo = require('../../../models/Student');
router.use(express.json());

router.post('/update', isSuperAdmin, async (req, res) => {
  try {
    const { sportId, jerseyNo, position } = req.body;
    // Find the user by jersey number
    const user = await studentInfo.findOne({ jerseyNo: jerseyNo });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const updatedEvent = await Event.findOneAndUpdate(
      { sportId: sportId, userId: user._id },
      { position: position },
      { new: true }
    );
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found or user not registered for the event' });
    }
    res.status(200).json({ message: 'position updated successfully', updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Error updating result' });
  }
});

module.exports = router;