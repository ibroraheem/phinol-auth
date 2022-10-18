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
            console.log(body)
            if (body.status === "success") return res.status(201).json({ data: body.data })
            res.status(200).json({ message: body.message, id })
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
            
            console.log(body.message)
            res.status(200).send(body.message)
            
        })
    } catch (error) {
        console.error(error.message)
        res.status(500).json({ error: error.message })
    }
}

module.exports = {buy, sell}