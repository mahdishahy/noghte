const express = require('express')

const banController = require('./../../controllers/v1/ban')
const authMiddleware = require('./../../middlewares/auth')
const isAdminMiddleware = require('./../../middlewares/isAdmin')

const router = express.Router()

router.route('/suspend/:id').put(authMiddleware, isAdminMiddleware, banController.suspend)

module.exports = router