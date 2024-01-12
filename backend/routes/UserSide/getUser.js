const express = require('express');
const router = express.Router();
const studentInfo = require('../../models/Student');
const Admin = require('../../models/Admin');
const fetchuser = require('../../middleware/fetchUser');
const isAdmin = require('../../middleware/isSuperAdmin');
router.use(express.json());

router.get('/getuser', fetchuser, async (req, res) => {
  try {
    const userId = req.student.id;
    const userType = req.student.role;
    if (userType === 'user') {
      const user = await studentInfo.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, user });
    } 
    else if (userType === 'admin') {
      const admin = await studentInfo.findById(userId).select('-password');
      if (!admin) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, user: admin });
    }
    else if (userType === 'superAdmin') {
      const superAdmin = await Admin.findById(userId).select('-password');
      if (!superAdmin) {
        return res.status(404).json({ success: false, message: 'Admin not found' });
      }
      return res.status(200).json({ success: true, user: superAdmin });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid userType' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error occurred' });
  }
});

module.exports = router;