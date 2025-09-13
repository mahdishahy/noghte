const express = require('express');

const userController = require('./../../controllers/v1/user');

const router = express.Router();

router.get(/^\/@([a-zA-Z0-9_]{5,15})$/, userController.getByUserName);

module.exports = router;