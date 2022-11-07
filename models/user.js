const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: " "
    },
    lastName: {
        type: String,
        default: " "
    },
    phoneNumber: {
        type: String,

    },
    username: {
        type: String,
    },
    role: {
        type: String,

        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    passwordResetToken: {
        type: Number,
    },
    otp: {
        type: Number
    },
    verificationCode: {
        type: Number
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    addresses: {
        type: Array,
        default: []
    },

    user_id: {
        type: String,
        
    },
    phinolMail: {
        type: String,
    },
    passwordResetToken: {
        type: Number
    },
    trades: {
        type: Array,
        default: []
    },
    trade_ids: {
        type: Array,
        default: []
    },
    referralCount: {
        type: Number,
        default: 0
    },
    phinBalance: {
        type: Number,
        default: 0
    },
    referredBy: {
        type: String,
        default: null
    }
},
    { timestamps: true }
)

const User = mongoose.model('User', UserSchema)
module.exports = User


