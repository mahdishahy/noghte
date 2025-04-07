const express = require('express');

const controller = require('./../../controllers/v1/interest')
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.route('/').get(authMiddleware, controller.get)
router.route('/edit').post(authMiddleware, controller.edit)

module.exports = router