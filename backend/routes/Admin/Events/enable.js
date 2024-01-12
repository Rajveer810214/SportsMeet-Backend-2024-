const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../../../middleware/isSuperAdmin');
const Sport = require('../../../models/Sports')
router.use(express.json());

router.put('/event/:id', isSuperAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Find the specific sport by sportId
    const updateStatus = await Sport.findById(id);
    if (!updateStatus) {
      return res.status(404).json({ success: false, message: "Sport not found" });
    }
    // Update the isActive field and save the document
    updateStatus.isActive = !updateStatus.isActive;
    await updateStatus.save();
    return res.status(200).json({ success: true, message: "Successfully updated the status of the event", updateStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update the status of the event" });
  }
});

router.put('/eventall', isSuperAdmin, async (req, res) => {
  try {
    // Find all sports
    const allSports = await Sport.find();
    if (!allSports || allSports.length === 0) {
      return res.status(404).json({ success: false, message: "No sports found" });
    }
    // Update the isActive field for all sports and save each document
    const updatedSports = await Promise.all(
      allSports.map(async (sport) => {
        sport.isActive = false;
        await sport.save();
        return sport;
      })
    );
    return res.status(200).json({ success: true, message: "Successfully updated the status of all sports", updatedSports });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update the status of sports" });
  }
});

module.exports = router;
