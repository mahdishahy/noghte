const express = require('express');

const controller = require('./../../controllers/v1/article')
const authMiddleware = require('./../../middlewares/auth')

const router = express.Router()

router.route('/').post(authMiddleware, controller.create).get(controller.getAll)
router.route('/:identifier').get(controller.findOne)
router.route('/like/:id').post(authMiddleware, controller.like)
router.route('/disLike/:id').post(authMiddleware, controller.dislike)
router.route('/getLike/:id').get(authMiddleware, controller.getLikes)
router.route('/edit/:id').put(authMiddleware, controller.edit)
router.route('/delete/:id').delete(authMiddleware, controller.remove)

module.exports = router