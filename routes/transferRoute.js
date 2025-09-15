const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer');

router.post('/authenticateTransferAPI', transferController.authenticateTransferAPI);
router.post('/getTransferCountryList', transferController.getTransferCountryList);
router.post('/GetDestinationSearch', transferController.GetDestinationSearch);
router.post('/GetTransferStaticData', transferController.GetTransferStaticData);
router.post('/GetSearchTransfer', transferController.GetSearchTransfer);
router.post('/GetBookingTransfer', transferController.GetBookingTransfer);
router.post('/GetBookingDetail', transferController.GetBookingDetail);

module.exports = router;