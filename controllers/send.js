const request = require('request');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateAddress = async (req, res) => {
    try {
        const { address, currency } = req.body;
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/${currency}/${address}/validate_address`,
            headers: { accept: 'application/json' }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body);
            if (Body.data.valid) return res.status(200).json({ message: "This address is valid." })
            return res.status(400).json({ message: "This address is invalid." })
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const sendCrypto = async (req, res) => {
    try {
        const token = req.authorization.token.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { currency, amount, to, narration, note } = req.body
        if (!to || !amount) return res.status(400).json({ message: 'address and amount are required parameters.' })
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(400).json({ message: 'invalid credentials' })
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
                transaction_note: note,
                narration: narration,
                fund_uid: to
            },
            json: true
        }
        request(options, function (error, response, body) {
            if (error) throw new Error(error)
            const Body = JSON.parse(body)
            if (Body.status === "success") return res.status(201).json({ data: Body.data })
            return res.status(400).json({ message: Body.message })
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}




module.exports = { validateAddress, sendCrypto }