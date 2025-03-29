const express = require('express');

const controller = require('./../../controllers/v1/article')
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.route('/').post(authMiddleware, controller.create).get(controller.getAll)

module.exports = router