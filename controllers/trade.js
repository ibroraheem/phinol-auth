const User = require("../models/user");
const History = require("../models/history");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()

const buy = async (req, res,) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const { amount, conversion, market, dollarValue, conversion_rate } = req.body
        const tradeAmount = Number(conversion) * 0.993
        const profit1 = Number(conversion * 0.007)
        const profit2 = Number(conversion * 0.004)
        if (dollarValue < 10) return res.status(400).json({ message: 'Minimum trade amount is $10' })
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) res.status(401).json({ message: 'Please verify your account' })
        if (!user.access) res.status(401).json({ message: 'Your account has been suspended' })
        if (!user.user_id) return res.status(401).json({ message: 'Wallet not generated yet' })
        if (market.split('-')[1] === 'usdt') {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { market: `${market.replace("-", "")}`, side: 'buy', ord_type: 'market', volume: String(tradeAmount) },
                json: true
            };

            request(options, function (error, response, body) {
                if (error) {
                    res.status(400).json({ error: error.message })
                }
                if (body.status === "success") {
                    user.phinBalance.trade += dollarValue / 100
                    user.phinBalance.total += dollarValue / 100
                    user.save()
                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        from: market.split('-')[1],
                        to: market.split('-')[0],
                        convert_from_value: ` ${amount} ${market.split('-')[1]}`,
                        convert_to_value: `${dollarValue} ${market.split('-')[0]}`,
                        fee: `$${Number(dollarValue) * 0.01}`,
                        type: "convert",
                        net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: { currency: `${market.split('-')[0]}`, amount: String(profit1), fund_uid: 'xc57w34g' },
                        json: true
                    };
                    request(options, function (error, response, body) {
                        if (error) {
                            res.status(400).json({ error: error.message })
                        }
                        if (body.status === "success")
                            return res.status(200).json({ message: 'Trade successfully completed' })
                    })
                } else {
                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        from: market.split('-')[1],
                        to: market.split('-')[0],
                        convert_from_value: ` ${amount} ${market.split('-')[1]}`,
                        convert_to_value: `${dollarValue} ${market.split('-')[0]}`,
                        fee: `$${Number(dollarValue) * 0.01}`,
                        conversion_rate: `$ `,
                        type: "convert",
                        net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                        status: 'failed',
                    })
                    return res.status(400).json({ message: 'Trade failed' })
                }
            });
        } else {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { market: `${market.split('-')[1]}usdt`, side: 'sell', ord_type: 'market', volume: amount },
                json: true
            };

            request(options, function (error, response, body) {
                if (error) {
                    res.status(400).json({ error: error.message })
                }
                user.trade_ids.push(body.data.id)
                user.save()
                if (body.status !== "success") return res.status(400).json({ message: "Insufficient Balance" });
                if (body.status === 'success') {
                    setTimeout(() => {
                        const options = {
                            method: 'GET',
                            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders/${body.data.id}`,
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                            }
                        }
                        request(options, function (error, response, body) {
                            request(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                const Body = JSON.parse(body);
                                if (Body.data.status === 'done') {
                                    const options = {
                                        method: 'POST',
                                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                                        headers: {
                                            accept: 'application/json',
                                            'content-type': 'application/json',
                                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                                        },
                                        body: { market: `${market.split("-")[0]}usdt`, side: 'buy', ord_type: 'market', volume: String(tradeAmount) },
                                        json: true
                                    }
                                    request(options, function (error, response, body) {
                                        if (error) {
                                            console.log(error);
                                            res.status(400).json({ error: error.message })
                                        }
                                        if (body.status === 'success') {
                                            generateId(6)
                                            user.phinBalance.trade += dollarValue / 100;
                                            user.phinBalance.total += dollarValue / 100;
                                            user.save();
                                            History.create({
                                                user_id: user._id,
                                                txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                                                quidaxID: body.data.id,
                                                from: market.split('-')[1],
                                                to: market.split('-')[0],
                                                convert_from_value: ` ${amount} ${market.split('-')[1]}`,
                                                convert_to_value: `${conversion} ${market.split('-')[0]}`,
                                                fee: `$${Number(dollarValue) * 0.01}`,
                                                type: "convert",
                                                conversion_rate: String(conversion_rate),
                                                net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                                                status: 'successful',
                                            })
                                            const options = {
                                                method: 'POST',
                                                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                                                headers: {
                                                    accept: 'application/json',
                                                    'content-type': 'application/json',
                                                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                                                },
                                                body: { currency: 'usdt', amount: String(profit2), fund_uid: 'xc57w34g' },
                                                json: true
                                            };
                                            request(options, function (error, response, body) {
                                                if (body.status === 'success') return res.status(200).json({ message: 'Trade Successful' })
                                            })
                                        } else {
                                            generateId(6)
                                            History.create({
                                                user_id: user._id,
                                                txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                                                quidaxID: body.data.id,
                                                from: market.split('-')[1],
                                                to: market.split('-')[0],
                                                convert_from_value: ` ${amount} ${market.split('-')[1]}`,
                                                convert_to_value: `${conversion} ${market.split('-')[0]}`,
                                                fee: `$${Number(dollarValue) * 0.01}`,
                                                conversion_rate: String(conversion_rate),
                                                net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                                                status: 'failed',
                                            })
                                            res.status(400).json({ message: 'Trade Failed Reason: Insufficient funds' })
                                        }

                                    })
                                }
                            });
                        })
                    }, 15000)

                }
            });
        }
    } catch (error) {
        console.log(error)
    }
}
const sell = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const { amount, conversion, market, dollarValue, conversion_rate } = req.body
        if (dollarValue < 10) return res.status(400).json({ message: 'Minimum trade amount is $10' })
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) res.status(401).json({ message: 'Please verify your account' })
        if (!user.access) res.status(401).json({ message: 'Your account has been suspended' })
        if (!user.user_id) return res.status(401).json({ message: 'Wallet not generated yet' })
        if (market.split('-')[1] === 'usdt') {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { market: `${market.replace('-', '')}`, side: 'sell', ord_type: 'market', volume: amount },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) {
                    res.status(400).json({ error: "Insufficient Balance" })
                }
                if (body.status === "success") {
                    user.phinBalance.trade += Number(dollarValue) / 100;
                    user.phinBalance.total += Number(dollarValue) / 100;
                    user.save();
                    generateId(6)
                    History.create({
                        user_id: user._id,
                        txID: result,
                        quidaxID: body.data.id,
                        from: market.split('-')[0],
                        to: market.split('-')[1],
                        convert_from_value: ` ${amount} ${market.split('-')[0]}`,
                        convert_to_value: `${dollarValue} ${market.split('-')[1]}`,
                        fee: `$${Number(dollarValue) * 0.01}`,
                        type: "convert",
                        conversion_rate: String(conversion_rate),
                        net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: { currency: 'usdt', amount: Number(dollarValue * 0.007).toString(), fund_uid: 'xc57w34g' },
                        json: true
                    };
                    request(options, function (error, response, body) {
                        if (body.status === 'success') return res.status(200).json({ message: 'Trade Successful' })
                    })
                } else {
                    History.create({
                        user_id: user._id,
                        txID: result,
                        quidaxID: body.data.id,
                        from: market.split('-')[0],
                        to: market.split('-')[1],
                        convert_from_value: ` ${amount} ${market.split('-')[0]}`,
                        convert_to_value: `${dollarValue} ${market.split('-')[1]}`,
                        fee: `$${Number(dollarValue) * 0.01}`,
                        conversion_rate: String(conversion_rate),
                        type: "convert",
                        net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                        status: 'failed',
                    })
                    res.status(400).json({ message: 'Trade Failed' })
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
                body: { market: `${market.split('-')[0]}usdt`, side: 'sell', ord_type: 'market', volume: amount },
                json: true
            };

            request(options, function (error, response, body) {
                if (error) {
                    res.status(400).json({ error: error.message })
                }
                if (body.status !== "success") return res.status(400).json({ message: "Insufficient Balance" });
                if (body.status === 'success') {
                    setTimeout(() => {
                        const options = {
                            method: 'GET',
                            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders/${body.data.id}`,
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                            }
                        }
                        request(options, function (error, response, body) {
                            request(options, function (error, response, body) {
                                if (error) throw new Error(error);
                                const Body = JSON.parse(body);
                                if (Body.data.status === 'done') {
                                    const options = {
                                        method: 'POST',
                                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
                                        headers: {
                                            accept: 'application/json',
                                            'content-type': 'application/json',
                                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                                        },
                                        body: { market: `${market.split("-")[1]}usdt`, side: 'buy', ord_type: 'market', volume: conversion },
                                        json: true
                                    }
                                    request(options, function (error, response, body) {
                                        if (error) {
                                            console.log(error);
                                            res.status(400).json({ error: error.message })
                                        }

                                        if (body.status === 'success') {
                                            user.phinBalance.trade += dollarValue / 100;
                                            user.phinBalance.total += dollarValue / 100;
                                            user.save();
                                            generateId(6)
                                            History.create({
                                                user_id: user._id,
                                                txID: result,
                                                quidaxID: body.data.id,
                                                from: market.split('-')[0],
                                                to: market.split('-')[1],
                                                type: "convert",
                                                convert_from_value: ` ${amount} ${market.split('-')[0]}`,
                                                convert_to_value: `${dollarValue} ${market.split('-')[1]}`,
                                                fee: `$${Number(dollarValue) * 0.01}`,
                                                conversion_rate: String(conversion_rate),
                                                type: "convert",
                                                net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                                                status: 'successful',
                                            })
                                            const options = {
                                                method: 'POST',
                                                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                                                headers: {
                                                    accept: 'application/json',
                                                    'content-type': 'application/json',
                                                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`,
                                                },
                                                body: { currency: `${market.split('-')[0]}`, amount: Number(dollarValue * 0.004).toString(), fund_uid: 'xc57w34g' },
                                                json: true
                                            };
                                            request(options, function (error, response, body) {
                                                if (body.status === 'success') return res.status(200).json({ message: 'Trade Successful' })
                                            })
                                        } else {
                                            generateId(6)
                                            History.create({
                                                user_id: user._id,
                                                txID: result,
                                                quidaxID: body.data.id,
                                                from: market.split('-')[0],
                                                to: market.split('-')[1],
                                                convert_from_value: ` ${amount} ${market.split('-')[0]}`,
                                                convert_to_value: `${dollarValue} ${market.split('-')[1]}`,
                                                fee: `$${Number(dollarValue) * 0.01}`,
                                                net_total: `$${Number(dollarValue) - Number(dollarValue) * 0.01}`,
                                                conversion_rate: String(conversion_rate),
                                                status: 'failed',
                                            })
                                            res.status(400).json({ message: 'Trade Failed' })
                                        }
                                    })
                                }
                            });
                        })
                    }, 15000)

                }
            });
        }
    } catch (error) {
        console.log(error)
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
                res.status(400).json({ message: "Insufficient Balance" })
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
                res.status(400).json({ message: "Insufficient Balance" })
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
            res.status(400).json({ message: "Insufficient Balance" })
        }
    })
}

module.exports = { buy, sell, getTrades, getTrade, getTickers, getPrice, pushTrades }