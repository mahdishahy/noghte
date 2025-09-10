const express = require('express');

const controller = require('./../../controllers/v1/auth')
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.get('/profile', authMiddleware, controller.getMe)
router.post('/logout', authMiddleware, controller.logout)

module.exports = router