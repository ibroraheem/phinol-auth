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
        if (user.verified) return res.status(401).json({ message: 'User not verified' })
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

            console.log(body);

            const Body = JSON.parse(body)
            if (Body.status === "success") {
                const options = {
                    method: 'POST',
                    url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json',
                        Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                    },
                    body: {
                        amount: parseFloat(amount) * 0.007,
                        currency: Body.data.market.split('-')[0],
                        fund_uid: 'me'
                    },
                    json: true
                }
                request(options, (error, response, body) => {
                    if (error) throw new Error(error);
                    res.status(201).json({ data: body })
                })
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
        if (user.verified) return res.status(401).json({ message: 'User not verified' })
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
            const Body = JSON.parse(body)
            if (Body.status === "success") return res.status(201).json({ data: Body.data })
            console.log(body.data);
        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {buy, sell}