const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event');
const isAdmin = require('../../../middleware/isAdmin');
const studentInfo = require('../../../models/Student');
const Sports = require('../../../models/Sports');
router.use(express.json());

const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create the Upstash Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

router.get('/allstudents', isAdmin, async (req, res) => {
  try {
    // Check if data is already cached
    const cachedData = await redis.get('allstudents');
    if (cachedData) {
      console.log('Returning cached data');
      return res.status(200).json(cachedData);
    }

    // If not cached, fetch the data from the database
    const users = await studentInfo.find().select("-password");
    const userIds = users.map(user => user._id);
    const events = await Event.find({ userId: { $in: userIds } });

    const usersWithEvents = await Promise.all(users.map(async user => {
      const userEvents = events.filter(event => event.userId.equals(user._id));
      const sportPromises = userEvents.map(async event => {
        const sport = await Sports.findOne(event.sportId);
        return sport;
      });
      const eventPositionPromises = userEvents.map(async event => {
        return event.position;
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

    const response = { users: usersWithEvents };

    // Store the fetched data in Redis with an expiration time
    await redis.set('allstudents', JSON.stringify(response)); // Cache for 60 seconds

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users and events' });
  }
});

module.exports = router;
