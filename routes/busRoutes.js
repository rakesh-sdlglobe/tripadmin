const express = require('express');
const router = express.Router();

const busController = require('../controllers/bus');

// Existing API routes
router.post('/authenticateBusAPI', busController.authenticateBusAPI);
router.post('/getBusCityList', busController.GetBusCityList);
router.post('/busSearch', busController.BusSearch);
router.post('/getBusSeatLayOut', busController.GetBusSeatLayOut);
router.post('/getBoardingPointDetails', busController.GetBoardingPintDetails);
router.post('/getBlock', busController.GetBlock);
router.post('/getBooking', busController.GetBook);
router.post('/getBookingDetails', busController.GetBookingDetails);

// Database routes - NO AUTHENTICATION
router.post('/createBusBooking', busController.createBusBooking);
router.get('/userBookings/:user_id', busController.getUserBusBookings);
router.get('/bookingDetails/:booking_id', busController.getBusBookingDetails);
router.put('/updateBookingStatus/:booking_id', busController.updateBusBookingStatus);
router.put('/cancelBooking/:booking_id', busController.cancelBusBooking);
router.get('/bookingStats/:user_id', busController.getBusBookingStats);

// Debug routes - NO AUTHENTICATION
router.get('/current-user', busController.getCurrentUserId);
router.get('/user-by-email/:email', busController.getUserByEmail);

module.exports = router;