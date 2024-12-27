const express = require('express');
const cors = require('cors');
const path = require('path')
const authRoutes = require('./routes/authRoute'); 
const userRoutes = require('./routes/userRoute'); 
const revenueRoutes = require('./routes/revenueRoute');
const trainRoutes = require('./routes/trainsRoute');
const emailRoutes = require('./routes/emailRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const otpRoutes = require('./routes/otpRoutes');

const app = express();

// Middleware setup
app.use(cors({
  origin: 'http://localhost:3000', // Allow only React app
  // origin: 'https://seemytrip.vercel.app', // Allow only seemytrip.vercel.app
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  // credentials: true, // Include credentials if needed
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking',revenueRoutes);
app.use('/api/trains',trainRoutes);
app.use('/api', emailRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/otp', otpRoutes);

app.use('/api/uploads', express.static(path.join(__dirname, '/uploads')));


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
