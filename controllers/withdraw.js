const User = require("../models/user");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()


const withdraw = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const { currency, amount, address, dollarValue } = req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (dollarValue > 10) {
            return res.status(401).json({ message: 'You cannot withdraw more than $10' })
        }
        if (currency === 'btc') {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: amount,
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        
                    }
                }
            })
        } else if (currency === 'eth') {
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { withdraw }

