const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance');


// Existing API routes
router.post('/authenticateInsuranceAPI', insuranceController.authenticateInsuranceAPI);
router.post('/GetInsuranceList', insuranceController.GetInsuranceList);
router.post('/GetInsuranceBook', insuranceController.GetInsuranceBook);
router.post('/GetInsurancePolicy', insuranceController.GetInsurancePolicy);
router.post('/GetInsuranceBookingDetails', insuranceController.GetInsuranceBookingDetails);
router.post('/CancelInsuranceBooking', insuranceController.CancelInsuranceBooking)

module.exports = router;