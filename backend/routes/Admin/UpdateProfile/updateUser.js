// routes/admin/deleteUser.js
const express = require('express');
const router = express.Router();
const Event = require('../../../models/Event')
const isSuperAdmin = require('../../../middleware/isSuperAdmin'); // Middleware to check admin role
const studentInfo = require('../../../models/Student');
// const bcrypt = require('bcrypt');
// Update request to update a user by ID
router.put('/updateuser/:userId', isSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await studentInfo.findById(userId);
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone
    if (req.body.urn) user.academicInfo.urn = req.body.urn;
    if (req.body.year) user.academicInfo.yearn = req.body.year;
    if (req.body.branch) user.academicInfo.branch = req.body.branch;
    if (req.body.course) user.academicInfo.course = req.body.course;
    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
})

// DELETE request to delete a user by ID
router.delete('/deleteuser/:id', isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // Delete the user by ID
    const deletedUser = await studentInfo.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const deletedUserEvents = await Event.deleteMany({userId : id})
    console.log(deletedUserEvents)
    if (!deletedUserEvents) {
    return  res.status(200).json({ message: 'User deleted successfully but he is not enroll in any event' });
    }
    res.status(200).json({ message: 'User and his all events deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

module.exports = router;
