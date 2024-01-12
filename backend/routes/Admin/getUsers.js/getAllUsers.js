const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
// const isSuperAdmin = require('../../../middleware/isSuperAdmin')
const isAdmin = require('../../../middleware/isAdmin')
const studentInfo = require('../../../models/Student');
const Sports = require('../../../models/Sports');
router.use(express.json());

router.get('/allstudents', isAdmin, async (req, res) => {
  try {
    // Fetch all users and exclude password and role fields
    const users = await studentInfo.find().select("-password");
    // Extract user IDs from users
    const userIds = users.map(user => user._id);
    // Find events where userId is in the list of user IDs
    const events = await Event.find({ userId: { $in: userIds } });
    // Merge events into each user's object
    const usersWithEvents = await Promise.all(users.map(async user => {
      const userEvents = events.filter(event => event.userId.equals(user._id));
      const sportPromises = userEvents.map(async event => {
        const sport = await Sports.findOne(event.sportId);
        return sport;
      });
      const eventPositionPromises = userEvents.map(async event => {
        return event.position; // Retrieve the position from the event
      });
      const sports = await Promise.all(sportPromises);
      const eventPositions = await Promise.all(eventPositionPromises);
      const eventsWithPosition = userEvents.map((event, index) => {
        return {
          ...event.toObject(),
          sport: sports[index],
          position: eventPositions[index]
        };
      });
      return {
        ...user.toObject(),
        events: eventsWithPosition
      };
    }));
    res.status(200).json({ users: usersWithEvents });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users and events' });
  }
});

module.exports = router;
