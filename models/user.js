const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
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
        unique: true,
        default: " "
    },
    role: {
        type: String,
        required: true,
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
        type: Array
    },

    user_id: {
        type: String,
        unique: true
    },
    passwordResetToken: {
        type: Number
    },
},
    { timestamps: true }
)

const User = mongoose.model('User', UserSchema)
module.exports = User


