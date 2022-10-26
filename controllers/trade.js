const User = require("../models/user");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()

const buy = async (req, res,) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        const { market, amount, conversion } = req.body
        const tradeAmount = Number(amount) * 0.993
        const profit = Number(amount) * 0.007
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) return res.status(401).json({ message: 'User not verified' })
        if (market.slice(4) === 'usdt') {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { market: market, side: 'buy', ord_type: 'market', volume: tradeAmount.toString() },
                json: true
            };
            console.log(req.body)
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === "success") {
                    setInterval(() => {

                        const options = {
                            method: 'POST',
                            url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                            headers: {
                                accept: 'application/json',
                                'content-type': 'application/json',
                                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                            },
                            body: {
                                currency: `${market.slice(0, 3)}`,
                                amount: profit.toString(),
                                fund_uid: 'me'
                            },
                            json: true
                        }
                        request(options, function (error, response, body) {
                            if (error) throw new Error(error);
                        })
                        res.status(200).json({ message: "Trade successfully completed", })

                    }, 25000)

                } else {
                    res.status(400).json({ message: body.message })
                    console.log(body)
                }
            })

        } else {

            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { market: `${market.slice(0, 3)}usdt`, side: 'sell', ord_type: 'market', volume: amount },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === "success") {
                    const convert = Number(conversion) * 0.993
                    const convertProfit = convert * 0.004
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: { market: `${market.slice(3)}usdt`, side: 'buy', ord_type: 'market', volume: convert.toString() },
                        json: true
                    };
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error)
                        if (body.status === "success") {
                            setInterval(() => {
                                const options = {
                                    method: 'POST',
                                    url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                                    headers: {
                                        accept: 'application/json',
                                        'content-type': 'application/json',
                                        Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                                    },
                                    body: {
                                        currency: `${market.slice(3)}`,
                                        amount: convertProfit.toString(),
                                        fund_uid: 'me'
                                    },
                                    json: true
                                }
                                request(options, function (error, response, body) {
                                    if (error) throw new Error(error);
                                })
                            }, 25000)
                            res.status(200).json({ message: "Trade successfully completed", })
                        }
                    })
                }
            })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: error.message })
    }

}

const sell = async (req, res) => {
    try {
        const { amount, market, conversion } = req.body

        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.verified == false) return res.status(401).json({ message: 'User not verified' })
        const profit = conversion * 0.007
        const tradeAmount = amount * 0.993
        const options = {
            method: 'POST',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            body: { market: market, side: 'sell', ord_type: 'market', volume: tradeAmount },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            if (body.status === "success") {
                setInterval(() => {
                    user.trades.push(body.data)
                    user.save()
                    console.log(body)
                }, 10000)
                const options = {
                    method: 'POST',
                    url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                    },
                    body: {
                        currency: `${market.slice(4, 7)}`,
                        amount: profit,
                        fund_uid: 'me'
                    },
                    json: true
                }
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                })
                res.status(200).json({ message: "Trade successfully completed", })

            } else {
                res.status(400).json({ message: body.message })
            }

        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ message: error.message })
    }
}

const getTrades = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User not found' });
        res.status(200).json({ message: 'Trades retrieved', trades: user.trades });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const pushTrades = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User not found' });
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders/${user.trade_ids.length - 1}`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            if (body.status === "success") {
                user.trades.push(body.data)
                user.save()
                res.status(200).json({ message: "Trade successfully completed" })
            } else {
                res.status(400).json({ message: body.message })
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getTrade = async (req, res) => {
    try {
        const { id } = req.params.id;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User not found' });
        const trade = user.trades.find(trade => trade.id === id);
        res.status(200).json({ message: 'Trade retrieved', trade });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getPrice = async (req, res) => {
    try {
        const { market } = req.body
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/markets/${market}/ticker`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            if (body.status === "success") {
                res.status(200).json({ message: "Price retrieved", price: body.data.ticker.last })
            } else {
                res.status(400).json({ message: body.message })
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getTickers = async (req, res) => {
    const market = req.params.market
    const options = {
        method: 'GET',
        url: `https://www.quidax.com/api/v1/markets/tickers/${market}`,
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
        },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        if (body.status === "success") {
            res.status(200).json({ message: "Tickers retrieved", tickers: body.data })
        } else {
            res.status(400).json({ message: body.message })
        }
    })
}

module.exports = { buy, sell, getTrades, getTrade, getTickers, getPrice, pushTrades }