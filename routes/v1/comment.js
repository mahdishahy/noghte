const express = require('express')

const authMiddleware = require('./../../middlewares/auth')
const isAdminMiddleware = require('./../../middlewares/isAdmin')
const controller = require('./../../controllers/v1/comment')

const router = express.Router()

router.route('/').post(authMiddleware, controller.create)
router.route('/change-status/:id').patch(authMiddleware, isAdmin, controller.changeStatus)

module.exports = router