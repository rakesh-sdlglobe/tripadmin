const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flights");
const isAuth = require("../middleware/isAuth");

router.post("/getFlightsAirports", flightController.getFlightsAirports);

module.exports = router;
