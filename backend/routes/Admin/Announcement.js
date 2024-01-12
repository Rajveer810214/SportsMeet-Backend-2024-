const express = require('express');
const router = express.Router();
const Announcement = require('../../models/Announcement'); // Capitalize model name
const isSuperAdmin = require('../../middleware/isSuperAdmin');

router.use(express.json());

router.post('/announcement', isSuperAdmin, async (req, res) => {
  const { title, message, link } = req.body;

  try {
    const newAnnouncement = new Announcement({
      title: title,
      message: message,
      link: link,
    });
    await newAnnouncement.save();
    res.status(200).json({ success: true, message: "Announcement sent successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to send announcement" });
  }
});

router.delete('/deleteannouncement/:id', isSuperAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const deleteAnnouncement = await Announcement.findByIdAndDelete(id);
      if (!deleteAnnouncement) {
        return res.status(400).json({ success: false, message: "Announcement not found" });

      }
      res.status(200).json({ success: true, message: "Announcement deleted successfully", deleteAnnouncement });
    } catch (error) {
      res.status(400).json({ success: false, message: "Announcement not deleted successfully" });
    }
  });

module.exports = router;
