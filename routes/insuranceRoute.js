const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance');


// Existing API routes
router.post('/authenticateInsuranceAPI', insuranceController.authenticateInsuranceAPI);
router.post('/GetInsuranceList', insuranceController.GetInsuranceList);
router.post('/GetInsuranceBook', insuranceController.GetInsuranceBook);
router.post('/GetInsurancePolicy', insuranceController.GetInsurancePolicy);
router.post('/GetInsuranceBookingDetails', insuranceController.GetInsuranceBookingDetails);
router.post('/CancelInsuranceBooking', insuranceController.CancelInsuranceBooking);

// Database routes - NO AUTHENTICATION (same as bus routes)
router.post('/createInsuranceBooking', insuranceController.createInsuranceBooking);
router.get('/userBookings/:user_id', insuranceController.getUserInsuranceBookings);
router.get('/bookingDetails/:booking_id', insuranceController.getInsuranceBookingDetails);
router.put('/updateBookingStatus/:booking_id', insuranceController.updateInsuranceBookingStatus);
router.put('/cancelBooking/:booking_id', insuranceController.cancelInsuranceBooking);
router.get('/bookingStats/:user_id', insuranceController.getInsuranceBookingStats);

// Email selected quotes
router.post('/sendSelectedQuotes', insuranceController.sendSelectedQuotes);

module.exports = router;