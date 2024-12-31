const express = require('express');
const router = express.Router();
const trainController = require('../controllers/train')
const isAuth = require("../middleware/isAuth")

router.get('/getStation', trainController.getStation);
router.post('/getTrains', trainController.getTrains);
router.post('/getTrains/avlFareEnquiry',isAuth.token, trainController.getTrainsAvailableFareEnquiry);

module.exports = router;