
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../../../models/Admin');
const studentInfo = require('../../../models/Student');
const { body, validationResult } = require('express-validator');
const generateOTP = require('./generateotp');
router.use(express.json());
const storedOTPs = {};

function cleanUpExpiredOTPs() {
  const now = Date.now();
  for (const email in storedOTPs) {
    if (storedOTPs[email].createdAt + 30 * 60 * 1000 < now) { // 30 minutes in milliseconds
      delete storedOTPs[email];
    }
  }
}
// Clean up expired OTPs every 30 minutes (1800000 milliseconds)
setInterval(cleanUpExpiredOTPs, 1800000);

// Modified /forgotpassword route
router.post('/forgotpassword', body('email').custom((value) => {
  // Check if the email ends with "@gndec.ac.in"
  if (!value.endsWith('@gndec.ac.in')) {
    throw new Error('Email must end with @gndec.ac.in');
  }
  return true; // Return true if validation passes
}), async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    const { email } = req.body;
    const adminEmail = await Admin.findOne({ email });
    if (adminEmail) {
      await generateOTP(email, 'Reset')
        .then(response => {
          // Store the OTP in your database or data structure
          const otp = response.otp
          storedOTPs[email] = otp; // Uncomment this line if you have 'storedOTPs' defined
          return res.status(200).json({ success: true, message: 'OTP sent successfully' });
        })
        .catch(error => {
          console.error('Error generating OTP:', error);
          return res.status(500).json({ success: false, message: 'Error generating OTP' });
        });
    }
    else {
      // Check if the user with the provided email exists in your database
      const student = await studentInfo.findOne({ email });
      if (!student) {
        return res.status(400).json({ success: false, message: "User with this email does not exist" });
      }
      // Generate the reset password OTP
      generateOTP(email, 'Reset')
        .then(response => {
          // Store the OTP in your database or data structure
          const otp = response.otp
          storedOTPs[email] = otp; // Uncomment this line if you have 'storedOTPs' defined
          return res.status(200).json({ success: true, message: 'OTP sent successfully' });
        })
        .catch(error => {
          console.error('Error generating OTP:', error);
          return res.status(500).json({ success: false, message: 'Error generating OTP' });
        });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error occurred" });
  }
});


router.post('/resetpassword', body('password', 'password should have a minimum length of 5').isLength({ min: 5 }), async (req, res) => {
  try {
    const { newPassword, otp } = req.body;
    const email = Object.keys(storedOTPs).find((key) => storedOTPs[key] === otp);
    // Verify the reset password OTP
    const storedOTP = storedOTPs[email];
    if (!storedOTP || storedOTP !== otp) {
      // OTP is incorrect or not found
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    const adminEmail = await Admin.findOne({ email });
    if (adminEmail) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      // Update the Admin's password with the hashed password
      adminEmail.password = hashedPassword;
      await adminEmail.save();
      // Optionally, you can delete the OTP from the storedOTPs object after successful password reset
      delete storedOTPs[email];
      return res.status(200).json({ success: true, message: "Password reset successful", });
    }
    // Update the user's password in the database
    const student = await studentInfo.findOne({ email });
    if (!student) {
      return res.status(400).json({ success: false, message: "User with this email does not exist" });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update the user's password with the hashed password
    student.password = hashedPassword;
    // Reset the verification status (if needed)
    await student.save();
    // Optionally, you can delete the OTP from the storedOTPs object after successful password reset
    delete storedOTPs[email];
    // Optionally, you can generate a new auth token and send it back to the client

    return res.status(200).json({ success: true, message: "Password reset successful", });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error occurred" });
  }
});

module.exports = router;
