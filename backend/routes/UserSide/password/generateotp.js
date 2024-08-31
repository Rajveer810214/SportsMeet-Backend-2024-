const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
const express = require('express');
const router = express.Router();
router.use(express.json());
require('dotenv').config();
const sendOTP = (email, validate) => {
    return new Promise((resolve, reject) => {
    const otp = randomstring.generate({ length: 6, charset: 'numeric' });
    const frontName = email.match(/^[a-zA-Z]+/)[0];
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
        },
    });
    const resultBody = validate === "Verification" ? `
        <p>Hello ${frontName}! 👋</p>
        <p>Welcome to the GNDEC Athletic Meet 2024 Registration App! 🎉 Verify your account using the OTP provided below:</p>
        <p><b>🔒 Verification OTP: ${otp} 🔒</b></p>
        <p>Join us for an unforgettable sports extravaganza 🏆🏃‍♂️🏃‍♀️ and showcase your athletic prowess. Stay tuned for event updates, special guests, and surprises! 🎊</p>
        <p>For any assistance, contact mail: gndecsports@gmail.com. Let's celebrate the spirit of sportsmanship together! 🤝</p>
        <p>Best regards,</p>
        <p>Team GNDEC Athletic Meet 2024 🏅</p>`
        : `<p>Hello ${frontName}! 👋</p>
        <p>We received a request to reset your password for the GNDEC Athletic Meet 2024 account. Use the OTP provided below to proceed with the reset:</p>
        <p><b>🔒 Reset OTP: ${otp} 🔒</b></p>
        <p>If you didn't request a password reset, please ignore this email. Your account is safe and no action is required.</p>
        <p>For any assistance, mail: gndecsports@gmail.com. We're here to help you!</p>
        <p>Best regards,</p>
        <p>Team GNDEC Athletic Meet 2024 🏅</p>`;
    const resultSubject = validate === "Verification" ? "🏅 GNDEC Athletic Meet 2024: Verify Your Account 🏅" : "🔑 Password Reset: GNDEC Athletic Meet 2024 🔑"
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: resultSubject,
        html: resultBody

    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            reject({ success: false, response: "Failed to send OTP." });
        } else {
            resolve({ success: true, response: info.response, otp }); // Include otp in the resolved object
        }
    });
    });
}

module.exports = sendOTP;