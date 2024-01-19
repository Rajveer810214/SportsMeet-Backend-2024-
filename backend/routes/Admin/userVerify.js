const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../../middleware/isSuperAdmin')
const studentInfo = require('../../models/Student');
router.use(express.json());

router.post('/userverify/:id', isSuperAdmin, async (req, res) => {
    try {
    const student_id = req.params.id;
    const student = await studentInfo.findById(student_id);
    student.isVerified = true;
    await student.save();
    return res.status(200).json({ success: true, message: student }); 
} catch (error) {
    return res.status(200).json({ success: false, message: "student not verified successfully" }); 
}
});

module.exports = router;
