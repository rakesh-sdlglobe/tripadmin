// controllers/otpController.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../utils/database');
const jwt = require('jsonwebtoken');

const otpStorage = {}; // In-memory storage for OTPs

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP to user's email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send('Email is required');

  // Check if the email exists in the database
  db.query('SELECT user_id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('Email not found');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time
    const expirationTime = Date.now() + parseInt(process.env.OTP_EXPIRATION_MINUTES) * 60000;
    otpStorage[email] = { otp, expirationTime };

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}. It will expire in ${process.env.OTP_EXPIRATION_MINUTES} minutes.`,
    };

    // Send OTP email
    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error(mailErr);
        return res.status(500).send('Error sending email');
      }

      res.status(200).send('OTP sent to your email');
    });
  });
};


// Verify OTP
// exports.verifyOtp = (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) return res.status(400).send('Email and OTP are required');

//   const storedOtpData = otpStorage[email];

//   if (!storedOtpData) {
//     return res.status(400).send('OTP not found or expired');
//   }

//   // Check if the OTP is expired
//   if (Date.now() > storedOtpData.expirationTime) {
//     delete otpStorage[email]; // Remove expired OTP
//     return res.status(400).send('OTP expired');
//   }

//   // Check if OTP matches
//   if (storedOtpData.otp === otp) {
//     delete otpStorage[email]; // Clear OTP after successful verification
//     // Update the isEmailVerified field to 1 in the database
//     db.query('UPDATE users SET isEmailVerified = 1 WHERE email = ?', [email]);

//     return res.status(200).send('OTP verified successfully');
//   }

//   res.status(400).send('Invalid OTP');
// };

exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).send('Email and OTP are required');

  const storedOtpData = otpStorage[email];

  if (!storedOtpData) {
    return res.status(400).send('OTP not found or expired');
  }

  // Check if the OTP is expired
  if (Date.now() > storedOtpData.expirationTime) {
    delete otpStorage[email]; // Remove expired OTP
    return res.status(400).send('OTP expired');
  }

  // Check if OTP matches
  if (storedOtpData.otp === otp) {
    delete otpStorage[email]; // Clear OTP after successful verification

    // Check if the email exists in the database
    db.query('SELECT user_id, email FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal server error');
      }

      if (results.length > 0) {
        // Email exists, update isEmailVerified to 1
        const user = results[0];
        db.query('UPDATE users SET isEmailVerified = 1 WHERE email = ?', [email], (updateErr) => {
          if (updateErr) {
            console.error('Error updating verification status:', updateErr);
            return res.status(500).send('Internal server error');
          }

          // Generate a token and return it
          const token = jwt.sign({ user_id: user.user_id }, process.env.SECRET, { expiresIn: '7d' });
          return res.json({
            token,
            user: email,
            // expiresIn: 3600,
          });
        });
      } else {
        // Email does not exist, create a new user
        const firstName = '';
        const middleName = '';
        const lastName = '';
        const password = ''; // Optional

        db.query(
          'INSERT INTO users (firstName, middleName, lastName, email, password, createdAt, updatedAt, isEmailVerified) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 1)',
          [firstName, middleName, lastName, email, password,],
          (insertErr, insertResults) => {
            if (insertErr) {
              console.error('Error creating new user:', insertErr);
              return res.status(500).send('Internal server error');
            }

            const newUserId = insertResults.insertId;

            // Generate a token and return it
            const token = jwt.sign({ user_id: newUserId }, process.env.SECRET, { expiresIn: '7d' });
            return res.json({
              token,
              user: email,
              // expiresIn: 3600,
            });
          }
        );
      }
    });
  } else {
    return res.status(400).send('Invalid OTP');
  }
};

