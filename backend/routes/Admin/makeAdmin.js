const express = require('express');
const router = express.Router();
const isSuperAdmin = require('../../middleware/isSuperAdmin')
const studentInfo = require('../../models/Student');
router.use(express.json());

router.post('/makeadmin', isSuperAdmin, async (req, res) => {
    try {
        const { role, id } = req.body;
        // Find the user by jersey number
        const user = await studentInfo.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const makeAdmin = await studentInfo.findOneAndUpdate(
            { _id: user._id },
            { role: role },
            { new: true }
        );
        if (!makeAdmin) {
            return res.status(404).json({ message: 'Error becoming admin' });
        }
        res.status(200).json({ message: 'You are successfully made him admin', makeAdmin });
    } catch (error) {
        res.status(500).json({ message: 'Error becoming admin' });
    }
});

module.exports = router;
