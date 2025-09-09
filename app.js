const express = require('express');
const cors = require('cors');
const path = require('path')
const bodyParser = require('body-parser');


const authRoutes = require('./routes/authRoute'); 
const userRoutes = require('./routes/userRoute'); 
const revenueRoutes = require('./routes/revenueRoute');
const trainRoutes = require('./routes/trainsRoute');
const emailRoutes = require('./routes/emailRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const otpRoutes = require('./routes/otpRoutes');
const hotelRoutes = require('./routes/hotelsRoute');
const flightRoutes = require('./routes/flightsRoutes');
const busRoutes = require('./routes/busRoutes');
const insuranceRoutes = require('./routes/insuranceRoute');
const transferRoutes = require('./routes/transferRoute');
const app = express();

// Middleware setup
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3002', 
  'https://stagews.irctc.co.in',
  'https://seemytrip.vercel.app',
  'https://tripadmin.onrender.com',
  'https://www.seemytrip.com',
  'https://tripadmin.seemytrip.com',
  'https://seemytrip.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error('Not allowed by CORS')); // Origin is not allowed
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  // credentials: true, // Uncomment if credentials are needed
}));

app.use(express.json());
app.use(bodyParser.json());


// Routes

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking',revenueRoutes);
app.use('/api/trains',trainRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bus', busRoutes);
app.use('/api', emailRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/transfer', transferRoutes);


app.use('/api/uploads', express.static(path.join(__dirname, '/uploads')));

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called at:', new Date().toISOString());
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// syncModels();

// Global error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
