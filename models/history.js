const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    txId: {
        type: String,
        required: true
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