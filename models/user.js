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
    username: {
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
        type: String
    },
    verificationCode: {
        type: Number
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
    },
    _2faEnabled: {
        type: Boolean,
        default: false
    },
    _2faVerified: {
        type: Boolean,
        default: false
    },
    _2faAscii: {
        type: String,
        default: null
    },
    _2faHex: {
        type: String,
        default: null
    },

    _2faBase32: {
        type: String,
        default: null
    },
    _2faAuthUrl: {
        type: String,
        default: null
    },
    access: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true }
)

const User = mongoose.model('User', UserSchema)
module.exports = User


