const express = require('express')
const router = express.Router()

const { buy, sell, getTrades, getTrade, getTickers, pushTrades } = require('../controllers/trade')

router.post('/buy', buy)
router.post('/sell', sell)
router.get('/trades', getTrades)
router.get('/trades/:trade_id', getTrade)
router.get('/tickers', getTickers)
router.post('/push-trades', pushTrades)

module.exports = router