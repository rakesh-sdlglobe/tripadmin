// controllers/passwordController.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const db = require('../utils/database'); // Assuming your database config is in config/db.js

// In-memory storage for OTPs (ideally, use a database or Redis in production)
let resetOtpStorage = {};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Step 1: Send Reset OTP
exports.sendResetOtp = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send('Email is required');

  const otp = crypto.randomInt(100000, 999999).toString();
  const expirationTime = Date.now() + parseInt(process.env.OTP_EXPIRATION_MINUTES) * 60000;
  resetOtpStorage[email] = { otp, expirationTime };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is ${otp}. It will expire in ${process.env.OTP_EXPIRATION_MINUTES} minutes.`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Error sending email');
    }
    res.status(200).send('Reset OTP sent to your email');
  });
};

// Step 2: Verify Reset OTP
exports.verifyResetOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).send('Email and OTP are required');

  const storedOtpData = resetOtpStorage[email];
  if (!storedOtpData || Date.now() > storedOtpData.expirationTime) {
    delete resetOtpStorage[email];
    return res.status(400).send('OTP expired or not found');
  }

  if (storedOtpData.otp === otp) {
    return res.status(200).send('OTP verified. You can now reset your password');
  }

  res.status(400).send('Invalid OTP');
};

exports.resetPassword = (req, res) => {
  const { email, newPassword } = req.body;
  console.log(req.body);
  
  if (!email || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email and new password are required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error querying the database' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    if (user.isEmailVerified === 0) {  // 0 means not verified, 1 means verified
      return res.status(403).json({ success: false, message: 'Email is not verified. Please verify your email before resetting the password.' });
    }

    bcrypt.compare(newPassword, user.password, (err, isMatch) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error comparing passwords' });
      }

      if (isMatch) {
        return res.status(400).json({ success: false, message: 'New password must be different from the old password' });
      }

      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Error hashing password' });
        }

        db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error updating password' });
          }

          delete resetOtpStorage[email];
          res.status(200).json({ success: true, message: 'Password reset successfully' });
        });
      });
    });
  });
};
