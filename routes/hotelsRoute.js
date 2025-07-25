const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotels');
const isAuth = require("../middleware/isAuth")


router.post('/getHotelCities', hotelController.getHotelCities);
router.post('/getHotelsList', hotelController.getHotelsList);
router.post('/getHotelDetails', hotelController.getHotelDetails);
router.post('/getPriceValidation', hotelController.getPriceValidation);
router.post('/getHotelImages', hotelController.getHotelImages);

module.exports = router;