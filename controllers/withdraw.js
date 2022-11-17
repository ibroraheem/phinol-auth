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
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets/${currency}/withdrawals`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    amount: amount,
                    fund_uid: address
                },
                json: true
            }
            request(options, (error, response, body) => {
                if (error) {
                    return res.status(400).json({ message: error.message })
                }
                if (body.status === 'success') {
                    user.phinBalance.withdrawal += dollarValue / 100
                    user.save()
                    
                    return res.status(200).json({ message: 'Withdrawal successful' })

                } else {
                    return res.status(400).json({ message: body.message })
                }
            })
        } else {
            return res.status(400).json({ message: 'Minimum withdrawal amount is $10' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { withdraw }

