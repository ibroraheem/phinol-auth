const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
    user_id: {
        type: String,
    },
    txID: {
        type: String,
    },
    type: {
        type: String,
    },
    from: {
        type: String,
    },
    to: {
        type: String,
    },
    convert_from_value: {
        type: String,
    },
    convert_to_value: {
        type: String,
    },
    convert_rate: {
        type: String,
    },
    currency: {
        type: String,
    },
    net_total: {
        type: String,
    },
    status: {
        type: String,
    },
    fee: {
        type: String,
    },
    wallet: {
        deposit_address:{ type: String, type: String },
    },
    done_at: {
        type: Date,
        default: Date.now
    }
},
    { timestamps: true }
)

const History = mongoose.model('History', historySchema)

module.exports = History