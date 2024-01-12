const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
// const isSuperAdmin = require('../../../middleware/isSuperAdmin')
const isAdmin = require('../../../middleware/isAdmin')
const studentInfo = require('../../../models/Student');
router.use(express.json());
router.post('/users', isAdmin, async (req, res) => {
  try {
    const { sportId } = req.body;
    const events = await Event.find({ sportId });
    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No events found for the given sportId' });
    }
    // Extract user IDs from the events
    const userIds = events.map(event => event.userId);
    // Find all users with the extracted user IDs
    const users = await studentInfo.find({ _id: { $in: userIds } }).select("-password -role");
    // Group events by user ID
    const userEventsMap = new Map();
    events.forEach(event => {
      const userId = event.userId.toString();
      if (!userEventsMap.has(userId)) {
        userEventsMap.set(userId, []);
      }
      userEventsMap.get(userId).push(event);
    });
    // Create an array of users with associated events
    const usersWithEvents = users.map(user => {
      const userId = user._id.toString();
      const events = userEventsMap.get(userId) || [];
      return {
        ...user.toObject(),
        events
      };
    });

    res.status(200).json({ users: usersWithEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users and events' });
  }
});


module.exports = router;
