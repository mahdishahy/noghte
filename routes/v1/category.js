const express = require('express');

const controller = require('../../controllers/v1/category');
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.route('/').post(authMiddleware, controller.create).get(controller.getAll)
router.route('/:identifier').get(controller.findOne)
router.route('/edit/:id').put(authMiddleware, controller.edit)
router.route('/delete/:id').delete(authMiddleware, controller.remove)

module.exports = router