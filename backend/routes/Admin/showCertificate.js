const express = require('express');
const router = express.Router();
require('dotenv').config();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const Admin = require('../../models/Admin');
const isSuperAdmin = require('../../middleware/isSuperAdmin');
router.use(express.json());

router.post('/sendcertificate', isSuperAdmin, 
  body('password', 'Password should have a minimum length of 5').isLength({ min: 5 }),
  body('email').custom((value) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(value) || !value.endsWith('@gndec.ac.in')) {
      throw new Error('Invalid email format or email must end with @gndec.ac.in');
    }
    return true;
  }), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: "Invalid Credentials", errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const passwordCompare = await bcrypt.compare(password, process.env.ADMINPASSWORD);
      if (passwordCompare) {
        
        try {
          const admins = await Admin.findOne({email : email});
          // Toggle isCertificate for all admins
          if(!admins){
            return res
            .status(500)
            .json({ success: false, message: "User not found" });
          }
            admins.isShowCertificate = !admins.isShowCertificate;
            await admins.save();
          return res.status(200).json({
            success: true,
            isShowCertificate: admins.isShowCertificate
          });
        } catch (error) {
          return res
            .status(500)
            .json({ success: false, message: "Invalid Credentials" });
        }
      }
      return res.status(400).json({ success: false, message: "Invalid Credentials" });
    } catch (error) {
      return res.status(500).json({ success: false, message: "An error occurred while comparing passwords" });
    }
  }
);
router.get('/iscertificate', async(req, res) => {
  try {
    const admin = await Admin.find({email : process.env.ADMINEMAIL});
    return res.status(200).json({
      success: true,
      isShowCertificate:admin[0].isShowCertificate
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      isCertificate:"some issue occured"
    });
  }
})
module.exports = router;