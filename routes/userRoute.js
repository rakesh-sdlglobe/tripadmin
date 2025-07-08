const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')
const isAuth = require("../middleware/isAuth")
const upload = require("../middleware/ImageUpdate.js")

router.get('/getUsers',isAuth.token, userController.getRecentUsers);
router.get('/userProfile', isAuth.token, userController.getUserProfile)
router.post('/editProfile', isAuth.token, userController.editUserProfile)
router.get('/myBookings', isAuth.token, userController.myBookings)
router.post('/addTraveler', isAuth.token, userController.addTraveller)
router.get('/getTravelers', isAuth.token, userController.getTravelers)
router.delete('/traveller/:id', isAuth.token, userController.removeTraveller);
router.put('/imageUpload/:id', isAuth.token, upload.single('img_url'), userController.imageUpload);

module.exports = router;