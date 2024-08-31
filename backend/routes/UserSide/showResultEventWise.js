const express = require('express');
const router = express.Router();
const Event = require('../../models/Event');
const studentInfo = require('../../models/Student');
const Sports = require('../../models/Sports');
router.use(express.json());

router.post('/result', async (req, res) => {
  try {
    const { sportId } = req.body;
    // Find all events with the specified sportId and non-zero position
    const results = await Event.find({ sportId, position: { $gt: 0 } });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No results found for the given sportId' });
    }
    // Extract user IDs from the results
    const userIds = results.map(result => result.userId);
    const sportIds = results.map(result => result.sportId);
    const allSports = await Sports.find({ _id: { $in: sportIds } });
    // Find all users with the extracted user IDs
    const users = await studentInfo.find({ _id: { $in: userIds } });
    // Add position to each user object
    const usersWithPosition = users.map(user => {
      const result = results.find(result => result.userId.equals(user._id));
      const sport = allSports.find(sport => sport._id.equals(result.sportId));
      return {
        _id: user._id,
        name: user.name,
        gender: user.gender,
        academicInfo: user.academicInfo,
        jeresyNo: user.jerseyNo,
        position: result.position,
        sportName: sport.sportName,
        sportType: sport.sportType,
        genderCategory: sport.genderCategory // Add the position from the result
      };
    });
    res.status(200).json({ message: 'Students who got some position', users: usersWithPosition });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving results' });
  }
});
router.get('/resultall', async (req, res) => {
  try {
    // Find all events with non-zero position
    const results = await Event.find({ position: { $gt: 0 } });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No results found with non-zero position' });
    }
    // Extract user IDs and sport IDs from the results
    const userIds = results.map(result => result.userId);
    const sportIds = results.map(result => result.sportId);
    const allSports = await Sports.find({ _id: { $in: sportIds } });
    // Find all users with the extracted user IDs
    const users = await studentInfo.find({ _id: { $in: userIds } });
    // Create a map of sport events and their respective results
    const sportEventMap = new Map();
    results.forEach(result => {
      const sport = allSports.find(sport => sport._id.equals(result.sportId));
      if (sport) {
        if (!sportEventMap.has(sport.sportName)) {
          sportEventMap.set(sport.sportName, []);
        }
        sportEventMap.get(sport.sportName).push(result);
      }
    });
    // Generate usersWithPosition array sorted by sport event and position
    const usersWithPosition = [];
    sportEventMap.forEach((sportResults, sportName) => {
      sportResults.sort((a, b) => a.position - b.position);
      sportResults.forEach(result => {
        const user = users.find(user => user._id.equals(result.userId));
        if (user) {
          usersWithPosition.push({
            _id: user._id,
            name: user.name,
            gender: user.gender,
            academicInfo: user.academicInfo,
            jerseyNo: user.jerseyNo,
            position: result.position,
            sportName: sportName,
            sportType: user.sportType,
            genderCategory: user.genderCategory
          });
        }
      });
    });
    
    res.status(200).json({ message: 'Students who got some position', users: usersWithPosition });
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(500).json({ message: 'Error retrieving results' });
  }
});


module.exports = router;
