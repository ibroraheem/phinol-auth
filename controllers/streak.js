const User = require('../models/user')
const Streak = require('../models/streak')
const jwt = require('jsonwebtoken')

const reward = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.find({ email: decoded.email })
    const streak = await Streak.findOne({ user: user._id })
    if (streak) {
        if (streak.lastAction.toDateString() === new Date().toDateString()) {
            return res.status(400).json({ message: 'You have already claimed your reward for today', phin: user.phinBalance})
        }
        if (streak.lastAction.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
            if (streak.streak >= 7) {
                streak.streak = 0
                streak.lastAction = new Date()
                streak.save()
                user.phinBalance.dailyEarning += 3
                user.phinBalance.total += 3
                user.save()
                return res.status(200).json({ message: 'You have claimed your reward for today', phin: user.phinBalance })
            } else if (streak.streak < 6) {
                streak.streak += 1
                streak.lastAction = new Date()
                streak.save()
                user.phinBalance.dailyEarning += 1
                user.phinBalance.total += 1
                user.save()
                return res.status(200).json({ message: 'You have claimed your reward for today', phin: user.phinBalance })
            } else {
                streak.streak += 1
                streak.lastAction = new Date()
                streak.save()
                user.phinBalance.dailyEarning += 2
                user.phinBalance.total += 2
                user.save()
                return res.status(200).json({ message: 'You have claimed your reward for today', phin: user.phinBalance })
            }
        }
        if (streak.lastAction.toDateString() !== new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
            streak.streak = 1
            streak.lastAction = new Date()
            streak.save()
            user.phinBalance.dailyEarning += 1
            user.phinBalance.total += 1
            user.save()
            return res.status(200).json({ message: 'You have claimed your reward for today', phin: user.phinBalance })
        }
    }
    const newStreak = new Streak({
        user: user._id,
        streak: 1,
        lastAction: new Date()
    })
    await newStreak.save()
    user.phinBalance.dailyEarning += 1
    user.phinBalance.total += 1
    user.save()
    return res.status(200).json({ message: 'You have claimed your reward for today', phinBalance: user.phinBalance })
}



module.exports = { reward }
