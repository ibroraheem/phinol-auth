const History = require('../models/history')
const User = require('../models/user')
const request = require('request')
const jwt = require('jsonwebtoken')

const getHistory = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        const history = await History.find({ user_id: user._id }).sort({createdAt: -1})
        console.log(history)   
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/deposits`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            json: true
        };
        request.get(options, function (error, response, body) {
            if (error) throw new Error(error);
            if (body.status === 'success') {
                const data = body.data
                const sortedData = data.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at)
                })
                return res.status(200).json({History: history.concat(sortedData)});
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



module.exports = { getHistory }
