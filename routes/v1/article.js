const express = require('express');

const controller = require('./../../controllers/v1/article')
const authMiddleware = require('./../../middlewares/auth')
const isAdmin = require('./../../middlewares/isAdmin')

const router = express.Router()

router.route('/').post(authMiddleware, controller.create).get(controller.getAll)
router.route('/:identifier').get(controller.findOne)
router.route('/edit/:id').put(authMiddleware, isAdmin, controller.edit)
router.route('/delete/:id').delete(authMiddleware, isAdmin, controller.remove)
router.route('/change-status/:id').patch(authMiddleware, isAdmin, controller.changeStatus)

module.exports = router