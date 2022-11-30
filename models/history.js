const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
    user_id: {
        type: String,
    },
    amount: {
        type: Number,
    },
    currency: {
        type: String,
    },
    type: {
        type: String,
    },
    status: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    txId: {
        type: String,
    },
    to: {
        type: String,
    },
    from: {
        type: String,
    },
},
    { timestamps: true }
)

const History = mongoose.model('History', historySchema)

module.exports = History