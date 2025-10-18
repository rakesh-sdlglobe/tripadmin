const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flights");
const isAuth = require("../middleware/isAuth");

router.post("/getFlightsAirports", flightController.getFlightsAirports);
router.post("/getFlightsList", flightController.getFlightsList);
router.post("/getFlightPriceValidate", flightController.getFlightPriceValidate);
router.post("/getFlightsListmobile", flightController.getFlightsListmobile);

module.exports = router;
