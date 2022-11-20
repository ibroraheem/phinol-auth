const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const request = require('request')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const Streak = require('../models/streak')


const google = async (req, res) => {
    try {
        const { email, firstName, lastName, password } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10)
        const user = await User.findOne({ email: email })
        if (user) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            console.log({ message: 'User Signed in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, user_id: user.user_id, access: user.access, token: token })
            return res.status(200).json({ message: 'User Signed in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: user.addresses, verified: user.verified, user: user.user_id, token: token })
        } else {
            const user = User.create({ email: email, password: hashedPassword, firstName: firstName, lastName: lastName, phoneNumber: Math.floor(1000 + Math.random() * 9000).toString(), user_id: Math.floor(1000 + Math.random() * 9000).toString(), verified: true })
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
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
            const otp = Math.floor(1000 + Math.random() * 9000).toString()
            const user = await User.create({ email, password: hashedPassword, otp, phinolMail: `${email.split('@')[0]}${Math.floor(1000 + Math.random() * 10)}@phinol.com`, username: `${email.split('@')[0]}`, referredBy: referralCode })
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
            return res.status(200).json({ message: 'User Signed up', email: user.email, firstName: user.firstName, lastName: user.lastName, username: user.username, addresses: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, phinolID: user.phinolID, token: token })

        } else {
            const otp = Math.floor(1000 + Math.random() * 9000).toString()
            const user = await User.create({ email, password: hashedPassword, otp, phinolMail: `${email.split('@')[0]}${Math.floor(Math.random() * 100)}@phinol.com`, username: `${email.split('@')[0]}` })
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
            res.status(201).json({ message: 'User registered successfully', email: user.email, firstName: user.firstName, tfaEnabled: user._2faEnabled, lastName: user.lastName, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, phinolID: user.phinolID, token: token })
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
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
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
        const otp = req.body.otp
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (user.otp == otp) {
            user.verified = true
            user.save()
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: { email: user.phinolMail },
                json: true
            }
            request(options, (error, response, body) => {
                if (error) throw new Error(error)
                console.log(body)
                if (body.status == 'success') {
                    user.user_id = body.data.id
                    user.save()
                    getWallet(user.user_id)
                    res.status(200).send({ message: 'User verified', email: user.email, phinolID: user.phinolID, address: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id })
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
        if (!user) return res.status(401).json({ message: 'Invalid Email' })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' })
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' })
        res.status(200).json({ message: 'User logged in', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
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
        const checkOldPassword = await bcrypt.compare(req.body.oldPassword, user.password)
        if (!checkOldPassword) return res.status(401).json({ message: 'Old Password is incorrect' })
        const hashedPassword = bcrypt.hashSync(req.body.newPassword, 10)
        user.password = hashedPassword
        user.save()
        res.status(200).json({ message: 'Password Change Successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error)
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
        if (!user.user_id) return res.status(401).json({ message: 'Wallet not generated yet' })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body)
            res.status(200).json({ message: 'Wallet fetched successfully', BTC: Body.data[2].balance, ETH: Body.data[6].balance, BNB: Body.data[7].balance, USDT: Body.data[3].balance})
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

const getWallet = async (user_id) => {
    let currency = ['btc', 'eth', 'usdt', 'bnb', 'matic', 'sol', 'xrp', 'link', 'dot', 'cake', 'ada']
    const length = currency.length
    for (let i = 0; i < length; i++) {
        const options = {
            method: 'POST',
            url: `https://www.quidax.com/api/v1/users/${user_id}/wallets/${currency[i]}/addresses`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
        });
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
            const Body = JSON.parse(body)
            let addresses = []
            const obj = {}
            let currency = ['btc', 'eth', 'usdt', 'bnb', 'matic', 'sol', 'xrp', 'link', 'dot', 'cake', 'ada']
            const length = currency.length
            for (let i = 0; i < length; i++) {
                obj['btc'] = Body.data[2].deposit_address
                obj['usdt'] = Body.data[3].deposit_address
                obj['eth'] = Body.data[6].deposit_address
                obj['bnb'] = Body.data[7].deposit_address
                obj['xrp'] = Body.data[8].deposit_address
                obj['matic'] = Body.data[15].deposit_address
                obj['dot'] = Body.data[19].deposit_address
                obj['link'] = Body.data[20].deposit_address
                obj['cake'] = Body.data[21].deposit_address
                obj['ada'] = Body.data[25].deposit_address
                obj['sol'] = Body.data[30].deposit_address
                addresses.push(obj)
                user.addresses = addresses
            }
            user.save()
            res.status(200).json({ message: 'Wallet saved successfully', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
        });
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
        const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({
            issuer: 'Phinol',
            name: user.phinolMail,
            length: 15
        })
        user._2faAscii = ascii
        user._2faHex = hex
        user._2faBase32 = base32
        user._2faAuthUrl = otpauth_url
        await user.save()
        QRCode.toDataURL(otpauth_url, (err, url) => {
            res.status(200).json({ message: 'OTP generated successfully', otpauth_url, setupKey: base32, url })
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const verifyOTP = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const email = decoded.email
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'User not found' })
    const { otp } = req.body
    const verified = speakeasy.totp.verify({
        secret: user._2faAscii,
        encoding: 'ascii',
        token: otp
    })
    if (verified) {
        user._2faEnabled = true
        user.save()
        res.status(200).json({ message: 'OTP verified successfully', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
    } else {
        res.status(401).json({ message: 'OTP verification failed' })
    }
}

const validateOTP = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const email = decoded.email
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'User not found' })
    const { otp } = req.body
    const verified = speakeasy.totp.verify({
        secret: user._2faAscii,
        encoding: 'ascii',
        token: otp
    })
    if (verified) {
        res.status(200).json({ message: 'OTP verified successfully' })
    } else {
        res.status(401).json({ message: 'OTP verification failed' })
    }
}

const disableOTP = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const email = decoded.email
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'User not found' })
    user._2faEnabled = false
    user.save()
    res.status(200).json({ message: 'OTP disabled successfully' })
}

const phinBalance = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const streak = Streak.findOne({ user: user.id })
        if (!streak) return res.status(401).json({ message: 'Streak not found' })
        res.status(200).json({ message: 'Phin balance Retrieved', phin: user.phinBalance, streak: streak.streak})
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const changeEmail = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const { newEmail, password } = req.body
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) return res.status(401).json({ message: 'Invalid password' })
        const checkEmail = await User.findOne({ email: newEmail })
        if (checkEmail) return res.status(401).json({ message: 'Email already exists' })
        const newToken = jwt.sign({ email: newEmail }, process.env.JWT_SECRET, { expiresIn: '1d' })
        user.email = newEmail
        user.save()
        res.status(200).json({ message: 'Email changed successfully', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: newToken })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
module.exports = { register, login, phinBalance, saveWallet, resendOTP, changePassword, verifyUser, forgotPassword, resetPassword, viewWalletBalance, google, viewAddresses, generateOTP, verifyOTP, validateOTP, disableOTP, changeEmail }