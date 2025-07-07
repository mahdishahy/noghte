const express = require('express')
const controller = require('./../../controllers/v1/search')

const router = express.Router()

router.get('/', controller.search)

module.exports = router