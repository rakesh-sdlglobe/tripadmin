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

// Send OTP function
const sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate OTP
    const otp = generateOTP(6); // Generate a 6-digit OTP
    const message = `Your One Time Password is ${otp}. Thanks SMSINDIAHUB`;

    // Store OTP with expiration (5 minutes)
    otpStorage[phoneNumber] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    // API details
    const apiUrl = 'http://cloud.smsindiahub.in/vendorsms/pushsms.aspx';
    const params = {
        APIKey: process.env.SMS_API_KEY,  // Your API key
        msisdn: phoneNumber,             // Recipient phone number
        sid: process.env.SMS_SENDER_ID,  // Sender ID
        msg: message,                    // The OTP message
        fl: 0,                           // Format flag (0 for plain text)
        gwid: 2                          // Gateway ID (provided by SMSIndiaHub)
    };

    try {
        const response = await axios.get(apiUrl, { params });

        // Log the entire response for debugging
        console.log('Response from SMSIndiaHub:', response.data);

        // Check the response for success
        if (response.data && response.data.ErrorCode === '000' && response.data.ErrorMessage === 'Done') {
            return res.status(200).json({ message: 'OTP sent successfully', jobId: response.data.JobId });
        } else {
            // Log unexpected response format or error
            console.error('Unexpected response:', response.data);
            return res.status(500).json({
                error: 'Failed to send OTP',
                details: response.data || 'Unknown error'
            });
        }
    } catch (error) {
        // Handle errors in making the API request
        console.error('Error while sending OTP:', error.message);
        return res.status(500).json({ error: 'Failed to send OTP', details: error.message });
    }
};


// Verify OTP function
const verifyOTP = (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const storedOtp = otpStorage[phoneNumber];

    // Check if OTP exists, matches, and is not expired
    if (storedOtp && storedOtp.otp === otp && storedOtp.expiresAt > Date.now()) {
        delete otpStorage[phoneNumber]; // Clear OTP after successful verification
        return res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
    }
};

module.exports = { sendOTP, verifyOTP };
