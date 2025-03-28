const express = require('express')

const banController = require('./../../controllers/v1/ban')
const authMiddleware = require('./../../middlewares/auth')
const isAdminMiddleware = require('./../../middlewares/isAdmin')
const userController = require('./../../controllers/v1/user')

const router = express.Router()

router.route('/suspend/:id').put(authMiddleware, isAdminMiddleware, banController.suspend)

router.get('/', authMiddleware, isAdminMiddleware, userController.getAll)
router.get('/:id', authMiddleware, isAdminMiddleware, userController.getById)
router.delete('/:id', authMiddleware, isAdminMiddleware, userController.remove)
router.put('/:id', authMiddleware, isAdminMiddleware, userController.update)
router.post('/change-role/:id', authMiddleware, isAdminMiddleware, userController.changeRole)

module.exports = router