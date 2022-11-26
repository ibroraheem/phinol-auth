const History = require('../models/history')
const User = require('../models/user')

const getHistory = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        const history = await History.find({ user_id: user.user_id })
        if (!history) return res.status(400).send('no history found')
        return res.status(200).json(history)
    } catch (error) {
        res.json({ error: error.message })
    }
}

const getHistoryById = async (req, res) => {
    try {
        const { history_id } = req.params
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({
            email: email
        })
        const history = await History.findOne({
            _id: history_id,
            user_id: user.user_id
        })
        if (!history) return res.status(400).send('no history found')
        return res.status(200).json(history)
    } catch (error) {
        res.json({ error: error.message })
    }
}

module.exports = { getHistory, getHistoryById }
