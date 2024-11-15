const axios = require('axios');
require('dotenv').config();

// Temporary in-memory storage for OTPs
const otpStorage = {};

// Function to generate OTP
function generateOTP(length) {
    let otp = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        otp += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return otp;
}

// Function to send OTP via SMSIndiaHub API
const sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP(6); // Generate a 6-digit OTP

    // Store OTP in memory with a timestamp
    otpStorage[phoneNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // Expires in 5 minutes

    // SMSIndiaHub API credentials from environment variables
    const apiKey = process.env.API_KEY;
    const userId = process.env.USER_ID;
    const password = process.env.PASSWORD;
    const senderId = process.env.SENDER_ID;
    const url = 'https://www.smsindiahub.in/api/mt/SendSMS';

    const message = `Your OTP is: ${otp}`;

    const data = {
        apiKey: apiKey,                
        user: userId,                  
        password: password,            
        phone: phoneNumber,            
        senderid: senderId,            
        route: '4',                    
        msg: message,                  
        type: 'text',                  
    };

    try {
        const response = await axios.post(url, null, { params: data });
        return res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to send OTP', details: error.response?.data });
    }
};

// Function to verify OTP
const verifyOTP = (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const storedOTP = otpStorage[phoneNumber];

    // Check if OTP exists and has not expired
    if (storedOTP && storedOTP.otp === otp && storedOTP.expiresAt > Date.now()) {
        // OTP is valid
        delete otpStorage[phoneNumber]; // Clear OTP after successful verification
        return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
};

module.exports = { sendOTP, verifyOTP };
