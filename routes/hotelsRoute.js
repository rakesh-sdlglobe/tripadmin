const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotels");
const isAuth = require("../middleware/isAuth");

router.post("/getHotelCities", hotelController.getHotelCities);
router.post("/getHotelsList", hotelController.getHotelsList);
router.post("/getHotelDetails", hotelController.getHotelDetails);
router.post("/getPriceValidation", hotelController.getPriceValidation);
router.post("/getHotelServiceTax", hotelController.getHotelServiceTax);
router.post("/getHotelPrebook", hotelController.getHotelPrebook);
router.post("/processPayment", hotelController.processPayment);
router.post("/getHotelBooked", hotelController.getHotelBooked);
router.post("/getHotelBookedDetails", hotelController.getHotelBookedDetails);
router.post("/getHotelImages", hotelController.getHotelImages);

module.exports = router;
