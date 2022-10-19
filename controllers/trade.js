const User = require("../models/user");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()

const buy = async (req, res,) => {
    try {

        const token = req.headers.authorization.split(' ')[1]
        const { market, amount } = req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) return res.status(401).json({ message: 'User not verified' })
        const options = {
            method: 'POST',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            body: { market: market, side: 'buy', ord_type: 'market', volume: amount },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            if (body.status === "success") {
                setInterval(() => {
                    user.trades.push(body.data)
                    user.save()
                    res.status(200).json({ message: body.message, data: body.data })
                }, 20000)
            } else {
                res.status(400).json({ message: body.message })
            }
        })

    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
    }

}

const sell = async (req, res) => {
    try {
        const { amount, market } = req.body

        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.verified == false) return res.status(401).json({ message: 'User not verified' })
        const options = {
            method: 'POST',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/orders`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            body: { market: market, side: 'sell', ord_type: 'market', volume: amount },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            if (body.status === "success") {
                setInterval(() => {
                    res.status(201).json({ data: body.data })
                    user.trades.push(body.data)
                    user.save()
                    res.status(200).json({ message: body.message, data: body.data })
                }, 20000)
            } else {
                res.status(400).json({ message: body.message })
            }

        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
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

module.exports = { buy, sell, getTrades, getTrade }