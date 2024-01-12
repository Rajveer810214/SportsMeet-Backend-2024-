// const { expect } = require('chai');
// const supertest = require('supertest');
// const app = require('../index'); // Import your Express app
// const request = supertest(app);

// describe('Authentication Endpoints', () => {
//     // Increase the timeout for the test to 10 seconds
//     it('should handle 5 concurrent signup requests', async function () {
//         const concurrentRequests = Array.from({ length: 50 }, (_, index) => ({
//             name: `Test User ${index}`,
//             email: `testuser${index}@gndec.ac.in`,
//             password: 'testpassword',
//             phone: `123456789${index}`, // Generate unique phone number
//             gender: 'male',
//             progressValue: 0,
//         }));

//         const signupPromises = concurrentRequests.map(async (userData) => {
//             try {
//                 const response = await request.post('/api/auth/signup').send(userData); // Adjust the route to match your API
//                 return response;
//             } catch (error) {
//                 console.error('Error during signup:', error);
//                 throw error; // Rethrow the error to propagate it
//             }
//         });

//         console.log('Sending signup requests...');
//         const signupResponses = await Promise.all(signupPromises);

//         signupResponses.forEach((response) => {
//             // console.log(response)
//             expect(response.status).to.equal(201);
//             expect(response.body.success).to.be.true;
//             expect(response.body.studentDetail).to.have.property('_id');
//         });
//     });
// });

// test the verify and sendotp route
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../index'); // Import your Express app
const request = supertest(app);
const studentInfo = require('../models/Student'); // Import your Student model

describe('User Verification Endpoints', () => {
    // Test for sending OTP and verifying all users
    it('should send OTP for user verification and verify all users', async () => {
        try {
            const students = await studentInfo.find({}); // Fetch all student documents
            if (!students || students.length === 0) {
                throw new Error('No students found in the database');
            }

            const otpPromises = students.map(async (student) => {
                const email = student.email;

                // Send OTP
                const otpResponse = await request.post('/api/validate/sendotp').send({ email });
                const otp = otpResponse.body.otp;

                // Verify user using OTP
                const verifyResponse = await request.post('/api/validate/verify').send({ otp });

                expect(verifyResponse.status).to.equal(200);
                expect(verifyResponse.body.success).to.be.true;
                expect(verifyResponse.body.message).to.equal('verify successfully');

                return verifyResponse;
            });

            const verifyResponses = await Promise.all(otpPromises);
            console.log(verifyResponses); // Log the responses for verification

        } catch (error) {
            throw error;
        }
    });
});
