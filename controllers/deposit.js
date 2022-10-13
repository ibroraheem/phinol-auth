const User = require("../models/user");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()

const getDeposits = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email })
        if(!user) return res.status(401).json({ message: 'User not found' })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/deposits?currency=usdt&state=submitted`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body)
            res.status(200).json({ data: Body.data })
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDeposit = async (req, res) => {
    try {
        const { deposit_id } = req.params
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/deposits/${deposit_id}`,
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        }
        request(options, function (error, response, body) {
            const Body = JSON.parse(body)
            res.status(200).json({ data: Body.data })
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getDeposits, getDeposit }