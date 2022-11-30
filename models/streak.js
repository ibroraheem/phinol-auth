const mongoose = require('mongoose')

const StreakSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    streak: {
        type: Number,
        default: 0
    },
    lastAction: {
        type: Date,
        default: Date.now
    },
    
},
    { timestamps: true })

const Streak = mongoose.model('Streak', StreakSchema)
module.exports = Streak
