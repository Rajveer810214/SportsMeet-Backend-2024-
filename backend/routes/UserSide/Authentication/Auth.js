const express = require('express');
const router = express.Router();
const studentInfo = require('../../../models/Student');
const academicInfo = require('../../../models/StudAcaInfo');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../../../models/Admin');
const rateLimit = require('express-rate-limit');
const JWT_Token = process.env.JWT_TOKEN;

router.use(express.json());

// Rate limiting middleware for signup route
const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many signup requests from this IP, please try again later.',
});

router.post('/signup', signupLimiter, [
  body('name', 'name should have a minimum length of 3').isLength({ min: 3 }),
  body('password', 'password should have a minimum length of 5').isLength({ min: 5 }),
  body('email').custom((value) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(value) || !value.endsWith('@gndec.ac.in')) {
      throw new Error('Invalid email format or email must end with @gndec.ac.in');
    }
    return true;
  }),
  body('phone').custom((value) => {
    if (!/^[1-9]\d{9}$/.test(value)) {
      throw new Error('Invalid phone number. It should be exactly 10 digits and should not start with "0"');
    }
    return true;
  }),
  async (req, res) => {
    const userAgent = req.get('User-Agent');

    // Check if the user-agent appears to be from a real browser
    if (!userAgent || userAgent.startsWith('Mozilla')) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Invalid Credentials", errors: errors.array() });
      }

      const validateUser = await studentInfo.findOne({ email: req.body.email });
      const validatephone = await studentInfo.findOne({ phone: req.body.phone });

      if (validateUser) {
        return res.status(400).json({ success: false, message: 'email' });
      }

      if (validatephone) {
        return res.status(400).json({ success: false, message: 'phone' });
      }

      try {
        const myPlaintextPassword = req.body.password;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        const { name, email, phone, gender, progressValue } = req.body;

        const studentDetail = await studentInfo.create({
          name: name,
          email: email,
          password: hash,
          phone: phone,
          gender: gender,
          progressValue: progressValue,
          isVerified: false,
          academicInfo: {}
        });

        await studentDetail.save();

        return res.status(201).json({ success: true, studentDetail });
      } catch (error) {
        res.status(400).json({ success: false, message: error.keyValue });
      }
    } else {
      // Handle automated request
      // console.log('Automated request detected. Blocked.');
      return res.status(403).json({ error: 'Access Forbidden' });
    }
  }
]);


router.post('/academicinfo/:id', async (req, res) => {
  try {
    const studentId = req.params.id;
    const existingStudentInfo = await studentInfo.findById(studentId);
    if (existingStudentInfo.academicInfo) {
      return res.status(404).json({ success: false, message: 'You cannot change your academic detail' });
    }
    if (!existingStudentInfo) {
      return res.status(404).json({ success: false, message: 'Student document not found' });
    }
    const existingStudent = await studentInfo.findOne({ "academicInfo.urn": req.body.urn });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "urn already exists" });
    }
    if (existingStudentInfo.isVerified === false) {
      return res.status(200).json({ success: false, message: "Please verify your account" });
    }
    const { course, branch, urn, year, progressValue } = req.body;
    // Create a new academicInfo object (correct model name)
    const newAcademicInfo = new academicInfo({
      course,
      branch,
      urn,
      year,
      progressValue,
    });
    // Push the newAcademicInfo object into the existingStudentInfo.academicInfo array
    existingStudentInfo.academicInfo = newAcademicInfo;
    // Save the updated studentInfo document
    await existingStudentInfo.save();
    res.status(200).json({ success: true, studentDetail: existingStudentInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to insert academic info', error });
  }
});

router.post('/login', body('password', 'password should have a minimum length of 5').isLength({ min: 5 }), body('email').custom((value) => {
  // Check if the email ends with "@gndec.ac.in"
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(value) || !value.endsWith('@gndec.ac.in')) {
    throw new Error('Invalid email format or email must end with @gndec.ac.in');
  }
  return true; // Return true if validation passes
}), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Invalid Credentials", errors: errors.array() });
  }
  const { email, password } = req.body;
  const adminEmail = await Admin.findOne({ email });
  if (adminEmail) {
    const passwordCompare = await bcrypt.compare(password, adminEmail.password);
    if (passwordCompare) {
      const data = {
        student: {
          id: adminEmail.id,
          role: adminEmail.role
        }
      }
      const authToken = jwt.sign(data, JWT_Token);
      return res.status(200).json({ success: true, authtoken: authToken });
    }
    else {
      return res.status(400).json({ success: false, message: "Please try to login with the correct credentials" });

    }
  }
  const student = await studentInfo.findOne({ email });
  if (!student) {
    return res.status(400).json({ success: false, message: "User Not found" });
  }
  const passwordCompare = await bcrypt.compare(password, student.password);
  if (passwordCompare) {
    const data = {
      student: {
        id: student.id,
        role: student.role
      }
    }
    if (student.isVerified === true) {
      const authToken = jwt.sign(data, JWT_Token);
      return res.status(200).json({ success: true, authtoken: authToken });
    }
    else {
      return res.status(200).json({ success: false, message: "Please verify your account" });
    }
  }
  return res.status(400).json({ success: false, message: "Please try to login with the correct credentials" });
});

module.exports = router;