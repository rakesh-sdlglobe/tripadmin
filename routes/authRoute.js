const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const isAuth = require("../middleware/isAuth");
// Signup Route
router.post("/signup", authController.signup);

// Login Route
router.post("/login", authController.login);

router.delete("/deleteAccount", isAuth.token, authController.deleteUser);

router.get('/auth/google', authController.googleAuth);

//mobile google login
router.post('/auth/googleUserData', authController.googleUserData);

module.exports = router;
