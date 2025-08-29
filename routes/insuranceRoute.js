const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insurance');


// Existing API routes
router.post('/authenticateInsuranceAPI', insuranceController.authenticateInsuranceAPI);
router.post('/GetInsuranceList', insuranceController.GetInsuranceList);
router.post('/GetInsuranceBook', insuranceController.GetInsuranceBook);

module.exports = router;