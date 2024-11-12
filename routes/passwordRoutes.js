// routes/passwordRoutes.js
const express = require('express');
const { sendResetOtp, verifyResetOtp, resetPassword } = require('../controllers/passwordController');

const router = express.Router();

router.post('/send-reset-otp', sendResetOtp);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

module.exports = router;
