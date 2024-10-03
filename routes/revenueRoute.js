const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenue')

router.get('/revenue', revenueController.getTotalBookingRevenue);


module.exports = router;
