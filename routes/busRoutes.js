const express = require('express');
const router = express.Router();

const busController = require('../controllers/bus');

router.post('/authenticateBusAPI', busController.authenticateBusAPI);
router.post('/getBusCityList', busController.GetBusCityList);
router.post('/busSearch', busController.BusSearch);
router.post('/getBusSeatLayOut', busController.GetBusSeatLayOut);
router.post('/getBoardingPointDetails', busController.GetBoardingPintDetails);

module.exports = router;