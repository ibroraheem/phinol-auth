const express = require('express')
const router = express.Router()

const { buy, sell } = require('../controllers/trade')
const {getTrades, getTrade} = require('../controllers/user')

router.post('/buy', buy)
router.post('/sell', sell)
router.get('/trades', getTrades)
router.get('/trades/:trade_id', getTrade)

module.exports = router