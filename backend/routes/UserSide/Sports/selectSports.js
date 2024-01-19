const express = require('express');
const fetchUser = require('../../../middleware/fetchUser')
const Sport = require('../../../models/Sports')
const Event = require('../../../models/Event'); // Assuming you have a model for Event
const router = express.Router();
router.use(express.json());

router.get('/getallsports', fetchUser, async (req, res) => {
  try {
    const fetchEvents = await Sport.find();
    res.status(200).json(fetchEvents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/eachstudentsports', fetchUser, async (req, res) => {
  try {
    const userId = req.student.id;
    // Find all events for the user and populate the sportId field with the 'Sport' model
    const userEvents = await Event.find({ userId })
      .populate('sportId', 'sportName sportType')
      .select('sportId attendance position serialNumber')
      .exec();
    if (!userEvents || userEvents.length === 0) {
      return res.status(404).json({ success: false, message: 'No events found for the user' });
    }
    // Extract sport names from the populated sportId field
    const participatedSports = userEvents.map(event => ({
      eventName: event.sportId.sportName,
      eventType: event.sportId.sportType,
      attendance: event.attendance,
      position: event.position,
      sportId: event.sportId._id,
      serialNumber:event.serialNumber,
    }));
    res.status(200).json(participatedSports);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user sports' });
  }
});

router.post('/addevent', fetchUser, async (req, res) => {
  try {
    const { sportIds = [] } = req.body;
    const set = new Set(sportIds);
    if (set.size !== sportIds.length) {
      return res.status(400).json({ success: false, message: 'You cannot select the same events' });

    }
    const userId = req.student.id;
    const existingEvents = await Event.find({ userId, sportId: { $in: sportIds } });
    const totalEventsCount = await Event.countDocuments({ userId });
    if (totalEventsCount > 2) {
      return res.status(400).json({ success: false, message: 'You cannot select more than 3 events' });
    }
    if (existingEvents.length > 0) {
      return res.status(400).json({ success: false, message: 'You already select this event' });
    }
    // Create new events and save them
    const newEvents = sportIds.map(sportId => new Event({ sportId, userId }));
    if ((newEvents.length + totalEventsCount) > 3) {
      return res.status(400).json({ success: false, message: 'You cannot select more than 3 events' });
    }
    const savedEvents = await Promise.all(newEvents.map(event => event.save()));
    res.status(200).json({ message: 'Events added successfully', savedEvents, totalEventsCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding events' });
  }
});

module.exports = router;