const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const request = require('request')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const json = require('body-parser/lib/types/json')


const google = async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10)
        const user = await User.findOne({ email: email })
        if (user) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            console.log({ message: 'User Signed in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, user_id: user.user_id, token: token })
            return res.status(200).json({ message: 'User Signed in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, user: user.user_id, token: token })
        } else {
            const user = User.create({ email: email, password: hashedPassword, firstName: firstName, lastName: lastName, phoneNumber: Math.floor(1000 + Math.random() * 9000).toString(), user_id: Math.floor(1000 + Math.random() * 9000).toString(), verified: true })
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            console.log({ message: 'User Signed in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, user_id: user.user_id, token: token })
            return res.status(200).json({ message: 'User Signed up via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, token: token })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message })
    }
}

const register = async (req, res) => {
    try {
        const { email, password, referralCode } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10)
        const isRegistered = await User.findOne({ email })
        if (isRegistered) return res.status(400).json({ error: 'User already registered' })
        const referralUser = await User.findOne({ user_id: referralCode })
        if (referralUser) {
            const user = await User.create({ email, password: hashedPassword, phoneNumber: Math.floor(1000 + Math.random() * 9000).toString(), username: `${email.split('@')[0]}`, user_id: Math.floor(1000 + Math.random() * 9000).toString(), referredBy: referralCode })
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
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
            return res.status(200).json({ message: 'User Signed up', email: user.email, firstName: user.firstName, lastName: user.lastName, username: user.username, addresses: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })

        } else {
            const otp = Math.floor(1000 + Math.random() * 9000)
            const user = await User.create({ email, password: hashedPassword, otp, user_id: otp.toLocaleString(), phoneNumber: otp.toString() })
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '12h'
            })
            const transporter = nodemailer.createTransport({
                host: 'smtp.zoho.com',
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
            res.status(201).json({ message: 'User registered successfully', email: user.email, firstName: user.firstName, tfaEnabled: user._2faEnabled, lastName: user.lastName, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
        }
    }

    catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error.message)
    }
}

const resendOTP = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        user.otp = otp
        await user.save()
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
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
        res.status(200).json({ message: 'OTP sent to your email' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const verifyUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const { otp } = req.body
        if (user.otp == otp) {
            user.verified = true
            user.otp = null
            await user.save()
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    email: user.phinolMail
                },
                json: true
            }
            request(options, (error, response) => {
                if (error) throw new Error(error)
                const Body = JSON.parse(response.body)
                user.user_id = Body.data.id
                user.save()
                if (Body.message === 'success') {
                    const currency = ['btc', 'eth', 'bnb', 'usdt']
                    currency.forEach(async (item) => {
                        const options = {
                            method: 'POST',
                            url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets/${item}/addresses`,
                            headers: {
                                accept: 'application/json',
                                'content-type': 'application/json',
                                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                            },
                        }
                        request(options, (error, response) => {
                            if (error) throw new Error(error)
                            const Body = JSON.parse(response.body)
                            if (Body.message === 'success') {
                                user.addresses.push({ currency: item, address: Body.data.address })
                                user.save()
                                res.status(200).json({ message: 'User verified successfully', email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
                            }
                        })
                    })
                }
            })
            
        } else {
            res.status(400).json({ message: 'Invalid OTP' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' })
        res.status(200).json({ message: 'User logged in', email: user.email, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, username: user.username, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        user.passwordResetToken = otp
        await user.save()
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.com',
            port: 465,
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
                res.status(200).json({ message: "OTP sent to user's email address" })
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const changePassword = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const hashedPassword = bcrypt.hashSync(req.body.password, 10)
        user.password = hashedPassword
        user.save()
        res.status(200).json({ message: 'Password Change Successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const { password, passwordResetToken } = req.body
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

const viewWalletBalance = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) return res.status(401).json({ message: 'User not verified' })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            const Body = JSON.parse(response.body)
            res.status(200).json({ message: 'Wallet balance fetched successfully', BTC: Body.data[3], ETH: Body.data[7], BNB: Body.data[8], USDT: Body.data[4] })
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error)
    }
}

const viewAddresses = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        res.status(200).json({ message: 'Addresses retrieved', address: user.addresses })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const saveWallet = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const user_id = user.user_id
        console.log(user_id);
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user_id}/wallets`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body);
            let addresses = [];
            let obj = {}
            obj['btc'] = Body.data[3].deposit_address
            obj['usdt'] = Body.data[4].deposit_address
            obj['eth'] = Body.data[7].deposit_address
            obj['bnb'] = Body.data[8].deposit_address
            addresses.push(obj)
            user.addresses = addresses
            user.save();
            res.status(200).json({ message: 'Wallet', firstName: user.firstName, lastName: user.lastName, email: user.email, verified: user.verified, addresses: user.addresses })
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const generateOTP = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({ issuer: 'Phinol', name: user.username, length: 20 })
        QRCode.toDataURL(otpauth_url, function (err, data_url) {
            user.otp_secret = ascii
            user.hex = hex
            user.base32 = base32
            user.save()
            res.status(200).json({ message: 'OTP generated successfully', otpauth_url, data_url })
        })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const verifyOTP = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const { token: token2 } = req.body
        const verified = speakeasy.totp.verify({
            secret: user.otp_secret,
            encoding: 'ascii',
            token: token2
        })
        if (verified) {
            user._2faEnabled = true
            user.save()
            res.status(200).json({ message: 'OTP verified successfully' })
        } else {
            res.status(401).json({ message: 'OTP verification failed' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const validateOTP = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const { token: token2 } = req.body
        const verified = speakeasy.totp.verify({
            secret: user.otp_secret,
            encoding: 'ascii',
            token: token2
        })
        if (verified) {
            res.status(200).json({ message: 'OTP verified successfully' })
        } else {
            res.status(401).json({ message: 'OTP verification failed' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const disableOTP = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        user._2faEnabled = false
        user.save()
        res.status(200).json({ message: 'OTP disabled successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}



module.exports = { register, login, saveWallet, resendOTP, changePassword, verifyUser, forgotPassword, resetPassword, viewWalletBalance, google, viewAddresses, generateOTP, disableOTP, validateOTP, verifyOTP }