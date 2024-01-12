const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../../../middleware/isSuperAdmin'); // Middleware to check admin role
const studentInfo = require('../../../models/Student');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
router.use(express.json());
// Update request to update a user by ID
router.put('/password/:userId', body('password', 'password should have a minimum length of 5').isLength({ min: 5 }), isSuperAdmin, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid Credentials", errors: errors.array() });
    }
    try {
      const userId = req.params.userId;
      const user = await studentInfo.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const myPlaintextPassword = req.body.password;
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(myPlaintextPassword, salt);
      user.password = hash;
      await user.save();
      res.status(200).json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating user' });
    }
  })

module.exports = router;