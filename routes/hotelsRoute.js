const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotels');
const isAuth = require("../middleware/isAuth")


router.post('/getHotelCities', hotelController.getHotelCities);
router.post('/getHotelsList', hotelController.getHotelsList);

module.exports = router;