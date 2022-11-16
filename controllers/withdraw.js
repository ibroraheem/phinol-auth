const User = require("../models/user");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()


const withdraw = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ email: decoded.email })
        const { currency, amount, address, dollarValue } = req.body
        const options = {
            method: 'POST',
            url: `https://www.quidax.com/api/v1/users/${user.quidaxId}/wallets/${currency}/withdrawals`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            body: {
                amount: amount,
                address: address,
                fund_uid: user.user_id
            },
            json: true
        }
        request(options, (error, response, body) => {
            if (error) {
                return res.status(400).json({ message: error.message })
            }
            if (body.status === 'success') {
                return res.status(200).json({ message: 'Withdrawal successful' })
            } else {
                return res.status(400).json({ message: body.message })
            }
        })
        if (!user) return res.status(401).json({ message: 'User not found' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { withdraw }

