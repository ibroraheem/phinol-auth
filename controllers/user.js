const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')
const request = require('request');



const google = async (req, res) => {
    try {
        let email = req.body.email
        let password = req.body.password
        let firstName = req.body.firstName
        let lastName = req.body.lastName
        let phoneNumber = Math.floor(1000 + Math.random() * 9000).toString()
        const user = await User.findOne({ email })
        if (user) {
            const token = jwt.sign({ email: user.email, google: true }, process.env.JWT_SECRET)
            res.status(200).json({ message: 'Sign in via google', email: user.email, firstName: user.firstName, lastName: user.lastName, phoneNumber: user.phoneNumber, token, verified: user.verified, addresses: user.addresses, phoneNumber: user.phoneNumber })
        } else {
            await User.create({ email: email, password: password, firstName: firstName, user_id: phoneNumber, lastName: lastName, phoneNumber: phoneNumber, verified: true })
            const token = jwt.sign({ email }, process.env.JWT_SECRET)

            res.status(200).json({ message: 'Sign up via google', token, email: user.email, firstName: user.firstName, firstName, lastName: user.lastName, verified: user.verified, addresses: user.addresses, phoneNumber: user.phoneNumber })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error.message)
    }
}

const register = async (req, res) => {
    try {
        const { email, password } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10)
        const isRegistered = await User.findOne({ email })
        if (isRegistered) return res.status(400).json({ error: 'User already registered' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        const user = await User.create({ email, password: hashedPassword, otp, user_id: otp.toLocaleString(), phoneNumber: otp.toString() })
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
        res.status(201).json({ message: 'User registered successfully', email: user.email, addresses: user.addresses, firstName: user.firstName, lastName: user.lastName, verified: user.verified, token: token })
    } catch (error) {
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
        res.status(200).json({ message: 'OTP sent to your email' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const verifyUser = async (req, res) => {
    try {
        const { otp } = req.body
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
    try {
        const { email, password } = req.body
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
        res.status(200).json({ message: 'Login Successful', email: user.email, verified: user.verified, addresses: user.addresses, phoneNumber: user.phoneNumber, firstName: user.firstName, lastName: user.lastName, token: token })
    } catch (error) {
        res.status(500).json({ error })
        console.log(error.message)
    }
}

const updateUser = async (req, res) => {
    try {
        const { phoneNumber, firstName, lastName } = req.body
        var user_id = ""
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (!user.verified) res.status(401).json({ message: 'Please verify your email first' })
        if (user.phoneVerified) return res.status(401).json({ message: 'Phone number already verified' })
        user.phoneNumber = phoneNumber
        user.firstName = firstName
        user.lastName = lastName

        // user.verificationCode = Math.floor(1000 + Math.random() * 9000)
        // const message = `Your verification code is ${user.verificationCode}`

        // const data = {
        //     "to": phoneNumber,
        //     "from": "Phinol",
        //     "sms": "Hi there, testing Termii" + message,
        //     "type": "plain",
        //     "api_key": process.env.SMS_TOKEN,
        //     "channel": "generic"
        // };
        // const options = {
        //     'method': 'POST',
        //     'url': 'https://api.ng.termii.com/api/sms/send',
        //     'headers': {
        //         'Content-Type': ['application/json', 'application/json']
        //     },
        //     body: JSON.stringify(data)

        // };
        // request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        // });

        // res.status(200).json({ message: 'User updated successfully. Verification Sent!' })


        let options = {
            method: 'POST',
            url: 'https://www.quidax.com/api/v1/users',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            },
            body: {
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber
            },
            json: true
        };

        request(options, async function (error, response, body) {
            if (error) throw new Error(error);
            if (error) res.send(error);
            console.log(body)
            user.user_id = body.data.id;
            await user.save()
            console.log(body.data.id);
            getWallet(body.data.id);
        });
        res.status(200).json({ message: 'User updated successfully', user: user })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// const verifyPhoneNumber = async (req, res) => {
//     const { verificationCode } = req.body
//     const token = req.headers.authorization.split(' ')[1]
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     try {
//         const user = await User.findOne({ email: decoded.email })
//         if (!user) return res.status(401).json({ message: 'User not found' })
//         if(!user.verified) return res.status(401).json({ message: 'Please verify your email first' })
//         if (user.verificationCode == verificationCode) {
//             user.phoneVerified = true
//             user.verificationCode = null
//             await user.save()
//             res.status(200).json({ message: 'Phone number verified' })
//             if (res.ok()) {
//                 let options = {
//                     method: 'POST',
//                     url: 'https://www.quidax.com/api/v1/users',
//                     headers: {
//                         accept: 'application/json',
//                         'content-type': 'application/json',
//                         Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
//                     },
//                     body: {
//                         email: '',
//                         first_name: user.firstName,
//                         last_name: user.lastName,
//                         phone_number: user.phoneNumber,
//                     },
//                     json: true
//                 };

//                 request(options, function (error, response, body) {
//                     if (error) throw new Error(error);
//                     user.user_id = body.data.id
//                     user.save()
//                 });
//                 let currency = ['btc', 'eth', 'usdt', 'bnb']
//                 const length = currency.length
//                 for (let i = 0; i < length; i++) {
//                     var url = `https://www.quidax/api/v1/users/${user.user_id}/wallets/${currency[i]}/addresses`
//                     const options = {
//                         method: 'POST',
//                         url: url,
//                         headers: {
//                             accept: 'application/json',
//                             Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
//                         }
//                     };

//                     request(options, function (error, response, body) {
//                         if (error) throw new Error(error);
//                     });
//                 }
//                 if (res.status(200)) {
//                     const options = {
//                         method: 'GET',
//                         url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets`,
//                         headers: {
//                             accept: 'application/json',
//                             Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
//                         }
//                     };

//                     request(options, function (error, response, body) {
//                         if (error) throw new Error(error);
//                         const Body = JSON.parse(body);
//                         let addresses = [];
//                         let obj = {}
//                         obj['btc'] = Body.data[3].deposit_address
//                         obj['usdt'] = Body.data[4].deposit_address
//                         obj['eth'] = Body.data[7].deposit_address
//                         obj['bnb'] = Body.data[8].deposit_address
//                         addresses.push(obj)
//                         user.addresses = addresses
//                         user.save()
//                     });
//                 }
//             }
//         } else {
//             res.status(401).json({ message: 'Invalid verification code' })
//         }

//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// }
// const createWallet = async (req, res) => {
//     try {
//         const token = req.headers.authorization.split(' ')[1]
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)
//         const email = decoded.email
//         const user = await User.findOne({ email })
//         if (!user) return res.status(401).json({ message: 'User not found' })

//         let options = {
//             method: 'POST',
//             url: 'https://www.quidax.com/api/v1/users',
//             headers: {
//                 accept: 'application/json',
//                 'content-type': 'application/json',
//                 Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
//             },
//             body: {
//                 email: '',
//                 first_name: user.firstName,
//                 last_name: user.lastName,
//                 phone_number: user.phoneNumber,
//             },
//             json: true
//         };

//         request(options, function (error, response, body) {
//             if (error) throw new Error(error);
//             user.user_id = body.data.id
//             user.save()
//         });
//         let currency = ['btc', 'eth', 'usdt', 'bnb']
//         const length = currency.length
//         for (let i = 0; i < length; i++) {
//             var url = `https://www.quidax/api/v1/users/${user.user_id}/wallets/${currency[i]}/addresses`
//             const options = {
//                 method: 'POST',
//                 url: url,
//                 headers: {
//                     accept: 'application/json',
//                     Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
//                 }
//             };

//             request(options, function (error, response, body) {
//                 if (error) throw new Error(error);
//             });
//         }
//         if (res.status(200)) {
//             for (let i = 0; i < length; i++) {
//                 url = `https://www.quidax/api/v1/users/${user.user_id}/wallets/`
//                 const options = {
//                     method: 'GET',
//                     url: url,
//                     headers: {
//                         accept: 'application/json',
//                         Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
//                     },

//                 }
//                 request(options, function (error, response, body) {
//                     if (error) throw new Error(error);
//                     user.addresses = [];
//                     user.addresses.push({ Currency: `${body.data.currency}`, Address: `${body.data.address}` })

//                 });
//             }
//         }

//     } catch (error) {
//         res.status(500).json({ error: error.message })
//     }
// }

const forgotPassword = async (req, res) => {
    try {
        const {email}  = req.body
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const otp = Math.floor(1000 + Math.random() * 9000)
        user.passwordResetToken = otp
        await user.save()
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
                res.status(200).json({message: "OTP sent to user's email address"})
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const token = req.headers.authorization.split(' ')[1]
        const user = await User.findOne({ email: email })
        if (!user) return res.status(404).json({ message: 'User not found. Log in to access wallet.' })
        if (!user.verified) return res.status(404).json({ message: 'Your account is not verified. Verify your account to access wallet' })
        const options = {
            method: 'GET',
            url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets/`,
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
            }
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            const Body = JSON.parse(body)
            res.status(200).json({ message: 'Wallet retrieved.', BTC: Body.data[3].balance, USDT: Body.data[4].balance, ETH: Body.data[7].balance, BNB: Body.data[8].balance })
        });
    } catch (error) {
        res.status(500).json({ error: error.message })
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
    let currency = ['btc', 'eth', 'usdt', 'bnb']
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
        console.log(user_id);
        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body, error);
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
            const Body = JSON.parse(body);
            let addresses = [];
            let obj = {}
            obj['usdt'] = Body.data[4].deposit_address
            obj['btc'] = Body.data[3].deposit_address
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

module.exports = { register, login, saveWallet, resendOTP, changePassword, verifyUser, updateUser, forgotPassword, resetPassword, viewWalletBalance, google, viewAddresses }