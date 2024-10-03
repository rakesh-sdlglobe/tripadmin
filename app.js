const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoute'); 
const userRoutes = require('./routes/userRoute'); 
const revenueRoutes = require('./routes/revenueRoute');
const trainRoutes = require('./routes/trainsRoute')

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/booking',revenueRoutes);
app.use('/api/trains',trainRoutes);


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
