const express = require('express');
const router = express.Router();
const Announcement = require('../../models/Announcement'); // Capitalize model name
const isSuperAdmin = require('../../middleware/isSuperAdmin');

router.use(express.json());

router.get('/announcement', async (req, res) => {

  try {
    const announcement = await Announcement.find();

    
    res.status(200).json({ success: true, message: "Announcement sent successfully", announcement });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to send announcement" });
  }
});

module.exports = router;
