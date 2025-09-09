const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer');

router.post('/authenticateTransferAPI', transferController.authenticateTransferAPI);
router.post('/getTransferCountryList', transferController.getTransferCountryList);
router.post('/GetDestinationSearch', transferController.GetDestinationSearch);

module.exports = router;