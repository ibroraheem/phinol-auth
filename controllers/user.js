const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const request = require('request');



const google = async (req, res) => {
    const { firstName, lastName, email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (user) return res.status(401).json({ message: 'User not found' })
        const User = await User.create({ firstName, lastName, email, password, verified: true })
        const token = jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.status(200).json({ message: 'Login Successful', user: user.email, firstName: user.firstName, lastName: user.lastName, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const register = async (req, res) => {
    const { email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    try {
        const isRegistered = await User.findOne({ email })
        if (isRegistered) return res.status(400).json({ error: 'User already registered' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        const user = await User.create({ email, password: hashedPassword, otp })
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify your email',
            html: `<h1>Enter the OTP code to verify your email</h1>
            <h2>OTP: ${otp}</h2>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
            }
        })
        res.status(201).json({ message: 'User registered successfully', user: user.email, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const verifyUser = async (req, res) => {
    const { otp } = req.body
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.otp == otp) {
            user.verified = true
            user.otp = null
            await user.save()
            res.status(200).json({ message: 'User verified' })
        } else {
            res.status(401).json({ message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(404).json({ error: 'User not found' })
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) {
            res.status(401).json({ error: 'Invalid password' })
        }
        const token = jwt.sign({ email: user.email, verified: user.verified }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.status(200).json({ message: 'Login Successful', user: user.email, token: token })
    } catch (error) {
        res.status(500).json({ error })
        console.log(error)
    }
}

const updateUser = async (req, res) => {
    const { phoneNumber, firstName, lastName } = req.body
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.phoneVerified) return res.status(401).json({ message: 'Phone number already verified' })
        user.phoneNumber = phoneNumber
        user.firstName = firstName
        user.lastName = lastName
        user.verificationCode = Math.floor(1000 + Math.random() * 9000)
        await user.save()
        const message = `Your verification code is ${user.verificationCode}`

        const data = {
            "to": phoneNumber,
            "from": "Phinol",
            "sms": "Hi there, testing Termii" + message,
            "type": "plain",
            "api_key": process.env.SMS_TOKEN,
            "channel": "generic"
        };
        const options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': ['application/json', 'application/json']
            },
            body: JSON.stringify(data)

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });

        res.status(200).json({ message: 'User updated successfully. Verification Sent!' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const verifyPhoneNumber = async (req, res) => {
    const { verificationCode } = req.body
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    try {
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.verificationCode == verificationCode) {
            user.verificationCode = null
            await user.save()
            res.status(200).json({ message: 'Phone number verified' })
        } else {
            res.status(401).json({ message: 'Invalid verification code' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        user.passwordResetToken = otp
        await user.save()
        const transporter = nodemailer.createTransport({
            service: 'Zoho',
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset',
            html: `<h1>Hi ${user.firstName} ${user.lastName}</h1>
            <p>Your password reset code is ${otp}</p>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const resetPassword = async (req, res) => {
    const { password, passwordResetToken } = req.body
    try {
        const user = await User.findOne({ passwordResetToken })
        if (!user) return res.status(401).json({ message: 'User not found' })
        user.password = bcrypt.hashSync(password, 10)
        user.passwordResetToken = null
        await user.save()
        res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createWallet = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })

        let options = {
            method: 'POST',
            url: 'https://www.quidax.com/api/v1/users',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
            },
            body: {
                email: '',
                first_name: user.firstName,
                last_name: user.lastName,
                phone_number: user.phoneNumber,
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            user.user_id = body.data.id
            user.save()
        });
        let currency = ['btc', 'eth', 'usdt', 'bnb']
        const length = currency.length
        for (let i = 0; i < length; i++) {
            var url = `https://www.quidax/api/v1/users/${user.user_id}/wallets/${currency[i]}/addresses`
            const options = {
                method: 'POST',
                url: url,
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
                }
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);
            });
        }
        for (let i = 0; i < length; i++) {
            url = `https://www.quidax/api/v1/users/${user.user_id}/wallets/${currency[i]}`
            const options = {
                method: 'GET',
                url: url,
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
                },

            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                let responseObject = JSON.parse(body)
            
            });
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const viewWalletBalance = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const email = decoded.email
    try {
        const user = await User.findOne({ email: email })
        if (!user) return res.status(404).json({ message: 'User not found. Log in to access wallet.' })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets/`,
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body)
            res.status(200).json({ message: 'Wallet retrieved.', BTC: Body.data[3].balance, USDT: Body.data[4].balance, ETH: Body.data[7].balance, BNB: Body.data[8].balance})
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


module.exports = { register, login, verifyUser, verifyPhoneNumber, updateUser, forgotPassword, resetPassword, createWallet, viewWalletBalance, google }