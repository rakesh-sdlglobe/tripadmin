const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')
const isAuth = require("../middleware/isAuth")

router.get('/getUsers',isAuth.token, userController.getRecentUsers);
router.get('/userProfile', isAuth.token, userController.getUserProfile)
router.post('/editProfile', isAuth.token, userController.editUserProfile)
router.get('/myBookings', isAuth.token, userController.myBookings)
router.post('/addTraveler', isAuth.token, userController.addTraveller)
router.get('/getTravelers', isAuth.token, userController.getTravelers)
router.delete('/traveller/:id', isAuth.token, userController.removeTraveller);
router.post('/imageUpload', isAuth.token,userController.imageUpload);

module.exports = router;