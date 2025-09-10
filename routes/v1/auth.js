const express = require('express');

const controller = require('./../../controllers/v1/auth')
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.get('/profile', authMiddleware, controller.getMe)

module.exports = router