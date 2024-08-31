const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
const Sport = require('../../../models/Sports');

// Add a serial number attribute to the Event collection based on conditions
router.post('/addSerialNumber', async (req, res) => {
  try {
    // Get all distinct sportIds with true attendance
    const sportIds = await Event.distinct('sportId', { attendance: 'present' });
    let serialNumber = 1;
    // Iterate through each sportId
    for (const sportId of sportIds) {
      // Find events with true attendance for the current sportId
      const eventsWithTrueAttendance = await Event.find({
        attendance: 'present',
        sportId: sportId,
      }).sort('position');

      // Update events with serial numbers
      
      for (const event of eventsWithTrueAttendance) {
        await Event.findByIdAndUpdate(event._id, { $set: { serialNumber } });
        serialNumber++;
      }
    }
    res.status(200).json({ message: 'Serial numbers added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
