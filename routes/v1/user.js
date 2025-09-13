const express = require('express')

const banController = require('./../../controllers/v1/ban')
const userController = require('./../../controllers/v1/user')
const followingController = require('./../../controllers/v1/following')
const favoriteController = require('./../../controllers/v1/favorite')
const authMiddleware = require('./../../middlewares/auth')
const isAdminMiddleware = require('./../../middlewares/isAdmin')

const router = express.Router()

router.route('/suspend/:id').put(authMiddleware, isAdminMiddleware, banController.suspend)

// router.get('/@:username', userController.getByUserName)
router.get('/', authMiddleware, isAdminMiddleware, userController.getAll)
router.get('/:id', authMiddleware, isAdminMiddleware, userController.getById)
router.delete('/:id', authMiddleware, isAdminMiddleware, userController.remove)
router.put('/:id', authMiddleware, userController.update)
router.post('/change-role/:id', authMiddleware, isAdminMiddleware, userController.changeRole)

router.post('/:id/follow', authMiddleware, followingController.followUser)
router.delete('/:id/unfollow', authMiddleware, followingController.unfollowUser)

// favorites
router.get('/profile/favorites', authMiddleware, favoriteController.get)
router.post('/profile/favorites/store', authMiddleware, favoriteController.create)

module.exports = router