const supertest = require('supertest');
const { expect } = require('chai');
const app = require('../index');

describe('Authentication Endpoints', function () {
    // Increase the timeout for the test to 20 seconds
    this.timeout(20000);

    it('should handle 5 concurrent signup requests', function (done) {
        const concurrentRequests = Array.from({ length: 500 }, (_, index) => {
            // Generate a unique 10-digit phone number
            const generateRandomPhoneNumber = () => {
                const randomNumber = Math.floor(1000000000 + Math.random() * 9000000000);
                return String(randomNumber).substring(0, 10);
            };
            
            // Example usage
            const phoneNumber = generateRandomPhoneNumber();
            console.log(phoneNumber);
            

            return {
                name: `Test User ${index}`,
                email: `testuser${phoneNumber}@gndec.ac.in`,
                password: 'testpassword',
                phone: phoneNumber,
                gender: 'male',
                progressValue: 0,
                isVerified: false,
                
                academicInfo: {}
            };
        });

        console.log('Sending signup requests...');

        Promise.all(concurrentRequests.map(async (userData) => {
            try {
                const response = await supertest(app).post('/api/auth/signup').send(userData);
                console.log('Response:', response.body);

                // Check for success before returning
                if (response.body.success !== true) {
                    throw new Error(`Failed signup for ${userData.email}: ${response.body.message}`);
                }

                // Validate successful requests
                expect(response.status).to.equal(201);
                expect(response.body.success).to.be.true;
                expect(response.body.studentDetail).to.have.property('_id');
            } catch (error) {
                // Handle failed request (e.g., log an error)
                console.error('Error during signup:', error.message);
                done(error); // Call done with an error to indicate a failed test
            }
        })).then(() => {
            console.log('Processed signup responses');
            done(); // Call done to indicate the completion of the test
        });
    });
});

// test the verify and sendotp route
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
//                 console.log(`Sent OTP for email ${email}:`, otp);

//                 // Verify user using OTP
//                 const verifyResponse = await request.post('/api/validate/verify').send({ otp });
//                 console.log(`Verification response for email ${email}:`, verifyResponse.body);

//                 expect(verifyResponse.status).to.equal(200);
//                 expect(verifyResponse.body.success).to.be.true;
//                 expect(verifyResponse.body.message).to.equal('verify successfully');

//                 return verifyResponse;
//             });

//             const verifyResponses = await Promise.all(otpPromises);
//             console.log('All verification responses:', verifyResponses);

//         } catch (error) {
//             console.error('Error during verification:', error.message);
//             throw error;
//         }
//     });
// });
