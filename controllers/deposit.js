const request = require('request')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config()

const getDeposits = async (req, res) => {
    try {
        const {currency} = req.body
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.find({ email: email })
        if (!user) return res.status(400).send('user does not exist')    
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/me/deposits?currency=${currency}&state=accepted`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body)
            if (Body.status !== 'success') {
                return res.status(400).json(Body);
            }
            return res.status(200).json(Body.data);
        }); 

    } catch (error) {
        res.json({ error: error.message })
    }
}



module.exports = {getDeposits}