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
const easebuzzPaymentRoutes = require('./routes/easebuzz_payments_Routes');
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
  // Easebuzz payment gateway domains
  'https://testpay.easebuzz.in',
  'https://pay.easebuzz.in',
  'http://testpay.easebuzz.in',
  'http://pay.easebuzz.in',
];

// CORS middleware - allow payment gateway callbacks from any origin
app.use((req, res, next) => {
  const isPaymentCallback = req.path?.includes('/payment_callback') || 
                            req.originalUrl?.includes('/payment_callback') ||
                            req.url?.includes('/payment_callback');
  
  if (isPaymentCallback) {
    // Allow payment callbacks from any origin (payment gateways redirect from their domains)
    cors({
      origin: true,
      methods: ['GET', 'POST'],
      credentials: false
    })(req, res, next);
  } else {
    // Normal CORS for other routes
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or server-to-server redirects)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
          callback(null, true); // Origin is allowed
        } else {
          callback(new Error('Not allowed by CORS')); // Origin is not allowed
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
      credentials: false,
    })(req, res, next);
  }
});

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for Easebuzz POST callbacks)


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
app.use('/api/easebuzzPayment', easebuzzPaymentRoutes);

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
  console.error('❌ Global Error Handler:', err.message);
  console.error(err.stack);
  
  // If it's a CORS error on a callback route, redirect to failure page instead of showing error
  if (err.message === 'Not allowed by CORS' && req.path.includes('/payment_callback')) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const txnid = req.body?.txnid || req.query?.txnid || '';
    console.log('⚠️ CORS error on callback, redirecting to failure page');
    return res.redirect(`${frontendUrl}/bus-payment-failure?txnid=${txnid}`);
  }
  
  // If it's a CORS error, send proper CORS error response
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Not allowed by CORS' });
  }
  
  res.status(500).send('Something broke!');
});


// Start server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
