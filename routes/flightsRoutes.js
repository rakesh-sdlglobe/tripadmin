const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flights");
const isAuth = require("../middleware/isAuth");

router.post("/getFlightsAirports", flightController.getFlightsAirports);
router.post("/getFlightsList", flightController.getFlightsList);
router.post("/getFlightFareRule", flightController.getFlightFareRule);
router.post("/getFlightPriceValidate", flightController.getFlightPriceValidate);
router.post("/getFlightServiceTax", flightController.getFlightServiceTax);
router.post("/getFlightPreBook", flightController.getFlightPreBook);
router.post("/getFlightBook", flightController.getFlightBook);
router.post("/getFlightBookDetails", flightController.getFlightBookDetails);

module.exports = router;
