const express = require('express');

const controller = require('./../../controllers/v1/banner')
const authMiddleware = require('./../../middlewares/auth')
const isAdminMiddleware = require('./../../middlewares/isAdmin')
const upload = require('../../config/multer')

const router = express.Router()

router.route('/').post(authMiddleware, isAdminMiddleware, (req, res, next) => {
    req.params.type = 'banner';
    next();
}, upload.single('file'), controller.create).get(controller.getAll)
router.route('/delete/:id').delete(authMiddleware, controller.remove)

module.exports = router