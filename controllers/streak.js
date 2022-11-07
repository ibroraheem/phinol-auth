const User = require('../models/user')
const Streak = require('../models/streak')
const jwt = require('jsonwebtoken')

export const reward = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    const streak = await Streak.findOne({ user: user._id })
    if (streak) {
        if (streak.streak >= 7) {
            streak.streak = 0
            streak.lastAction = Date.now()
            streak.save()
            if (streak.streak < 6) {
                user.phinBalance += 1
                user.save()
                res.status(200).json({ message: 'You have been rewarded with 100 PHIN' })
            } else if (streak.streak === 6) {
                user.phinBalance += 2
            } else {
                user.phinBalance += 3
            }
            res.json({ message: `You have been awarded ${user.phinBalance}` })
        } else {
            res.json({ message: 'You have not completed the streak' })
        }
    } else {
        res.json({ message: 'You have not completed the streak' })
    }
}

