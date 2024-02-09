
// // test the verify and sendotp route
// const { expect } = require('chai');
// const supertest = require('supertest');
// const app = require('../index'); // Import your Express app
// const request = supertest(app);
// const studentInfo = require('../models/Student'); // Import your Student model

// describe('User Verification Endpoints', () => {
//     // Test for sending OTP and verifying all users
//     it('should send OTP for user verification and verify all users', async () => {
//         try {
//             const students = await studentInfo.find({}); // Fetch all student documents
//             if (!students || students.length === 0) {
//                 throw new Error('No students found in the database');
//             }

//             const otpPromises = students.map(async (student) => {
//                 const email = student.email;

//                 // Send OTP
//                 const otpResponse = await request.post('/api/validate/sendotp').send({ email });
//                 const otp = otpResponse.body.otp;

//                 // Verify user using OTP
//                 const verifyResponse = await request.post('/api/validate/verify').send({ otp });

//                 expect(verifyResponse.status).to.equal(200);
//                 expect(verifyResponse.body.success).to.be.true;
//                 expect(verifyResponse.body.message).to.equal('verify successfully');

//                 return verifyResponse;
//             });

//             const verifyResponses = await Promise.all(otpPromises);
//             console.log(verifyResponses); // Log the responses for verification

//         } catch (error) {
//             throw error;
//         }
//     });
// });