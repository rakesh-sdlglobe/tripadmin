require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../utils/database'); // Assuming you have a DB connection setup
const { generateAccessToken, generateRefreshToken } = require('./genTokens');

const otpStorage = {}; // In-memory storage for OTPs
const DEFAULT_LOGIN_EMAIL = process.env.DEFAULT_LOGIN_EMAIL
  ? process.env.DEFAULT_LOGIN_EMAIL.toLowerCase()
  : null;

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createFallbackLoginPayload = (email) => {
  const extractedFirstName = (email?.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '');
  const fallbackFirstName = extractedFirstName || 'Traveller';
  const fallbackUser = {
    user_id: `fallback-${Buffer.from(email).toString('hex').slice(0, 8)}`,
    email,
    firstName: fallbackFirstName,
  };

  const token = generateAccessToken(fallbackUser);
  const user1 = { user_id: fallbackUser.user_id, email: fallbackUser.email };

  return {
    email: fallbackUser.email,
    firstName: fallbackUser.firstName,
    token,
    user1,
  };
};

const completeLoginForEmail = (email, res, options = {}) => {
  const { allowFallback = false } = options;
  const emailParts = email.split('@');
  const extractedFirstName = emailParts[0] || '';
  const sanitizedFirstName = extractedFirstName.replace(/[^a-zA-Z0-9]/g, '') || 'Traveller';

  const insertUserQuery = `
    INSERT INTO users (email, firstName, isEmailVerified)
    VALUES (?, ?, 1)
    ON DUPLICATE KEY UPDATE isEmailVerified = 1, firstName = COALESCE(firstName, ?)
  `;

  db.query(insertUserQuery, [email, sanitizedFirstName, sanitizedFirstName], (err) => {
    if (err) {
      console.error("Error inserting user:", err);
      if (allowFallback) {
        console.warn("Falling back to stateless login for email:", email);
        return res.status(200).json(createFallbackLoginPayload(email));
      }
      return res.status(500).send("Error processing user record");
    }

    db.query("SELECT user_id, email, firstName FROM users WHERE email = ?", [email], (err2, userResults) => {
      if (err2 || !userResults.length) {
        console.error("Error fetching user ID:", err2);
        if (allowFallback) {
          console.warn("Falling back to stateless login while fetching user:", email);
          return res.status(200).json(createFallbackLoginPayload(email));
        }
        return res.status(500).send("Error retrieving user");
      }

      const user = {
        id: userResults[0].user_id,
        email: userResults[0].email,
        firstName: userResults[0].firstName,
      };

      const accessToken = generateAccessToken(user);
      const user1 = { user_id: user.id, email: user.email };

      return res.status(200).json({
        email,
        firstName: user.firstName || sanitizedFirstName,
        token: accessToken,
        user1,
      });
    });
  });
};

// Send OTP to user's email
exports.sendEmailOtp = (req, res) => {
  const { email } = req.body;
  console.log("Email from request =>", email);

  if (!email) return res.status(400).send("Email is required");

  // Generate a 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Set OTP expiration time
  const expirationTime = Date.now() + process.env.OTP_EXPIRATION_MINUTES * 60000;
  otpStorage[email] = { otp, expirationTime };

  // Mail options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in ${process.env.OTP_EXPIRATION_MINUTES} minutes.`,
  };

  transporter.sendMail(mailOptions, (mailErr, info) => {
    if (mailErr) {
      console.error("Error sending email:", mailErr);
      return res.status(500).send({ "error" : "Error sending email: " + mailErr.message });
    }
    res.status(200).send({ "success" : "OTP sent to your email"});
  });
};

exports.verifyEmailOtp = (req, res) => {
  
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).send("Email and OTP are required");
  const storedOtpData = otpStorage[email];

  if (!storedOtpData) {
    return res.status(400).send("OTP not found or expired");
  }

  // Check if OTP is expired
  if (Date.now() > storedOtpData.expirationTime) {
    delete otpStorage[email];
    return res.status(400).send("OTP expired");
  }

  // Check if OTP matches
  if (storedOtpData.otp !== otp) {
    return res.status(400).send("Invalid OTP");
  }

  // OTP is valid, remove it
  delete otpStorage[email];

  return completeLoginForEmail(email, res);
};

exports.defaultEmailLogin = (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.toLowerCase() : '';

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!DEFAULT_LOGIN_EMAIL) {
      return res.status(500).json({
        message: "Default login email is not configured on the server.",
      });
    }

    if (normalizedEmail !== DEFAULT_LOGIN_EMAIL) {
      return res.status(401).json({ message: "Unauthorized default login" });
    }

    return completeLoginForEmail(normalizedEmail, res, { allowFallback: true });
  } catch (error) {
    console.error("Error in defaultEmailLogin:", error);
    const normalizedEmail = typeof req.body?.email === 'string'
      ? req.body.email.toLowerCase()
      : null;
    if (
      normalizedEmail &&
      (error?.code === 'ER_BAD_DB_ERROR' || error?.code === 'ECONNREFUSED')
    ) {
      console.warn("Database unavailable, falling back to stateless login for:", normalizedEmail);
      return res.status(200).json(createFallbackLoginPayload(normalizedEmail));
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};


// exports.sendEmailOtp = (req, res) => {
//   const { email } = req.body;
//   console.log("email from 20 ==>", email);
  

//   if (!email) return res.status(400).send('Email is required');

//   // Check if the email is already verified
//   db.query('SELECT isEmailVerified FROM users WHERE email = ?', [email], (err, results) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).send('Error checking email verification');
//     }

//     const user = results[0];
//     if (user && user.isEmailVerified === 1) {
//       return res.status(400).send('This email is already verified.');
//     }

//     // Generate a 6-digit OTP
//     const otp = crypto.randomInt(100000, 999999).toString();

//     // Set OTP expiration time
//     const expirationTime = Date.now() + process.env.OTP_EXPIRATION_MINUTES * 60000;
//     otpStorage[email] = { otp, expirationTime };

//     // Mail options
//     const mailOptions = {
//       from: process.env.GMAIL_USER,
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP code is ${otp}. It will expire in ${process.env.OTP_EXPIRATION_MINUTES} minutes.`,
//     };

//     transporter.sendMail(mailOptions, (mailErr, info) => {
//       if (mailErr) {
//         console.error(mailErr);
//         return res.status(500).send('Error sending email');
//       }
//       res.status(200).send('OTP sent to your email');
//     });
//   });
// };

// Verify OTP

// exports.verifyEmailOtp = (req, res) => {
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
//     // Clear OTP after successful verification
//     delete otpStorage[email];

//     // Update the isEmailVerified field to 1 in the database
//     db.query('UPDATE users SET isEmailVerified = 1 WHERE email = ?', [email], (err, result) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error updating email verification status');
//       }
//       res.status(200).send('OTP verified successfully and email is now verified');
//     });
//   } else {
//     res.status(400).send('Invalid OTP');
//   }
// };
