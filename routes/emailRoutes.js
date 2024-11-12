// routes/otpRoutes.js
const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/emailAuth');
const { sendEmailOtp, verifyEmailOtp } = require('../controllers/emailVerification');

const router = express.Router();

router.post('/send-otp-auth', sendOtp);
router.post('/verify-otp-auth', verifyOtp);
router.post('/send-otp', sendEmailOtp);
router.post('/verify-otp', verifyEmailOtp);

module.exports = router;
