const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance');


// Existing API routes
router.post('/authenticateInsuranceAPI', insuranceController.authenticateInsuranceAPI);
router.post('/GetInsuranceList', insuranceController.GetInsuranceList);

module.exports = router;