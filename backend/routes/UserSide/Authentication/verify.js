const express = require('express');
const router = express.Router();
const studentInfo = require('../../../models/Student');
const { body, validationResult } = require('express-validator');
const generateOTP = require('../password/generateotp');

router.use(express.json());
const storedOTPs = {};
router.post('/sendotp', body('email').custom((value) => {
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
        // Check if the user with the provided email exists in your database
        const student = await studentInfo.findOne({ email });
        
        if (!student) {
            return res.status(400).json({ success: false, message: "User with this email does not exist" });
        }
        if (student.isVerified) {
            return res.status(400).json({ success: false, message: "User already verified" });

        }
        // Generate and send the OTP only if the user exists
        generateOTP(email, 'Verification')
            .then(response => {
                // Store the OTP in your database or data structure
                const otp = response.otp
                storedOTPs[email] = otp; // Uncomment this line if you have 'storedOTPs' defined
                return res.status(200).json({ success: true, message: 'OTP sent successfully', });
            })
            .catch(error => {
                console.error('Error generating OTP:', error);
                return res.status(500).json({ success: false, message: 'Error generating OTP' });
            });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { otp } = req.body;
        const email = Object.keys(storedOTPs).find((key) => storedOTPs[key] === otp);
        const storedOTP = storedOTPs[email];
        if (!storedOTP || storedOTP !== otp) {
            // OTP is incorrect or not found
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        const student = await studentInfo.findOne({ email });
        if (!student) {
            return res.status(400).json({ success: false, message: "User with this email does not exist" });
        }
        await studentInfo.updateOne(
            { email: email },
            { $set: { isVerified: true } }
        );// Update the verification status
        delete storedOTPs[email];
        return res.status(200).json({ success: true, message: "verify successfully" });
    } catch {
        res.status(400).send("Invalid OTP.");
    }
});

module.exports = router;