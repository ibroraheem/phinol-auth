const express = require('express')
const router = express.Router()

const { withdraw } = require('../controllers/withdraw')

router.post('/withdraw', withdraw)

module.exports = router 