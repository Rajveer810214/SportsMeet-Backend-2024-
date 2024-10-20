// Importing the route handlers
const express = require('express');
const cors = require('cors');
const connectToMongo = require('./db');
const app = express();
require('dotenv').config();

app.use(cors());
// Connect to MongoDB
connectToMongo();
// Route Handlers

//User Routes
const authRoute = require('./routes/UserSide/Authentication/Auth');
const userRoute = require('./routes/UserSide/getUser');
const validateRoute = require('./routes/UserSide/Authentication/verify');
const passwordResetRoute = require('./routes/UserSide/password/resetPassword');
const startRoute = require('./routes/UserSide/wakingServer');
const sportsRoute = require('./routes/UserSide/Sports/selectSports');
const getAnnoucement = require('./routes/UserSide/getAnnouncement')
const ldapRouter = require('./routes/Ldap/ldap');

// Admin Routes
const sendcertificateRoute = require('./routes/Admin/showCertificate');
const markQrAttendace = require('./routes/Admin/Attendance/qrAttend')
const getAllParticularSportsStudents = require('./routes/Admin/getUsers.js/particularSportsUsers');
const markResult = require('./routes/Admin/Result/markResult');
const updateStudent = require('./routes/Admin/UpdateProfile/updateUser');
const enableEvent = require('./routes/Admin/Events/enable');
const updateEvent = require('./routes/Admin/Events/updateEvent');
const fetchAllStudents = require('./routes/Admin/getUsers.js/getAllUsers');
const updatePassword = require('./routes/Admin/UpdateProfile/updatePassword');
const makeAdmin = require('./routes/Admin/makeAdmin');
const showResult = require('./routes/UserSide/showResultEventWise')
const manuallyVerify = require('./routes/Admin/userVerify');
const announcement = require('./routes/Admin/Announcement');
const generateSerialNo = require('./routes/Admin/GenerateSerialNo/GenSerialNo');
// Assigning the route handlers to specific paths
//user side
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/validate', validateRoute);
app.use('/api/password', passwordResetRoute);
app.use('/api/start', startRoute);
app.use('/api/sports', sportsRoute)
app.use('/api', getAnnoucement);
app.use('/api/ldap', ldapRouter);

//Admin side
app.use('/api', sendcertificateRoute);
app.use('/api/attendance', markQrAttendace);
app.use('/api/sportsUser', getAllParticularSportsStudents);
app.use('/api/result', markResult);
app.use('/api/update', updateStudent);
app.use('/api/enable', enableEvent);
app.use('/api/update', updateEvent);
app.use('/api/fetch', fetchAllStudents);
app.use('/api/update', updatePassword);
app.use('/api/update', makeAdmin);
app.use('/api/view', showResult);
app.use('/api/mannually', manuallyVerify);
app.use('/api', announcement);
app.use('/api', generateSerialNo);
// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App is listening on port ${port} `);
});
module.exports = app