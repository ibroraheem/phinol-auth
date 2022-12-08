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
        const { email, password } = req.body
        const hashedPassword = bcrypt.hashSync(password, 10)
        const user = await User.findOne({ email: email })
        if (user) {
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            return res.status(200).json({ message: 'User Signed in via google', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
        } else {
            const newUser = await User.create({ email, password: hashedPassword, phinolMail: `${email.split('@')[0]}${Math.floor(Math.random() * 1000)}@phinol.com`, username: `${email.split('@')[0]}`, addresses: [], verified: true })
            const streak = await Streak.create({ user: newUser._id, streak: 1 })
            newUser.phinBalance.dailyEarning += 1
            newUser.phinBalance.total += 1
            newUser.save()
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            const options = {
                method: 'POST',
                url: 'https://www.quidax.com/api/v1/users',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
                },
                body: { email: newUser.phinolMail },
                json: true
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === 'success') {
                    newUser.user_id = body.data.id
                    newUser.save()
                    return res.status(200).json({ message: 'User Signed up via google', email: newUser.email, phinolID: newUser.phinolID, firstName: newUser.firstName, lastName: newUser.lastName, addresses: newUser.addresses, verified: newUser.verified, user: newUser.user_id, token: token, streak: streak.streak })
                } else {
                    console.log(body)
                    res.status(500).json({ error: body })
                }

            });
        }
    } catch (error) {
        console.log(error)
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
            const newStreak = await Streak.create({ user: user._id, streak: 1 })
            user.phinBalance.dailyEarning += 1
            user.phinBalance.total += 1
            await user.save()
            console.log(newStreak)
            const token = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '12h' })
            const transporter = nodemailer.createTransport({
                host: 'premium73.web-hosting.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Verify your email',
                html:
                    `
<body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">Verification Code</h2>
            <p>Enter this code to verify your account</p>
            <p style="font-size: 50; font-weight: 800">${otp}</p>
            <p>You can ignore this message if you didn't request this code.</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
    </body>`
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Email sent: ' + info.response)
                }
            })
            return res.status(201).json({ message: 'User Signed up', email: user.email, firstName: user.firstName, lastName: user.lastName, username: user.username, addresses: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, phinolID: user.phinolID, token: token, streak: newStreak.streak })

        } else {
            const otp = Math.floor(1000 + Math.random() * 9000).toString()
            const user = await User.create({ email, password: hashedPassword, otp, phinolMail: `${email.split('@')[0]}${Math.floor(Math.random() * 100)}@phinol.com`, username: `${email.split('@')[0]}` })
            const newStreak = await Streak.create({ user: user._id, streak: 1 })
            user.phinBalance.dailyEarning += 1
            user.phinBalance.total += 1
            await user.save()
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '12h'
            })
            const transporter = nodemailer.createTransport({
                host: 'premium73.web-hosting.com',
                port: 465,
                secure: true,

                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Verify your email',
                html:
                    `
                <body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">Verification Code</h2>
            <p>Enter this code to verify your account</p>
            <p style="font-size: 50; font-weight: 800">${otp}</p>
            <p>You can ignore this message if you didn't request this code.</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
    </body>
                `
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error)
                } else {
                    console.log('Email sent: ' + info.response)
                }
            })
            res.status(201).json({ message: 'User registered successfully', email: user.email, firstName: user.firstName, tfaEnabled: user._2faEnabled, lastName: user.lastName, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, phinolID: user.phinolID, token: token, streak: newStreak.streak })
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
            host: 'premium73.web-hosting.com',
            port: 465,
            secure: true,

            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify your email',
            html:
                `
                <body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">Verification Code</h2>
            <p>Enter this code to verify your account</p>
            <p style="font-size: 50; font-weight: 800">${otp}</p>
            <p>You can ignore this message if you didn't request this code.</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
    </body>`
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
        const referrer = await User.findOne({ user_id: user.referredBy })
        if (user.otp == otp) {
            user.verified = true
            user.save()
            if (referrer) {
                referrer.referralCount += 1
                referrer.phinBalance.referral += 20
                referrer.phinBalance.total += 20
                referrer.save()
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
                    if (body.status == 'success') {
                        user.user_id = body.data.id
                        user.save()
                        getWallet(user.user_id)
                        res.status(200).send({ message: 'User verified', email: user.email, phinolID: user.phinolID, address: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id })
                    }
                })
            } else {
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
                    if (body.status == 'success') {
                        user.user_id = body.data.id
                        user.save()
                        getWallet(user.user_id)
                        res.status(200).send({ message: 'User verified', email: user.email, phinolID: user.phinolID, address: user.addresses, tfaEnabled: user._2faEnabled, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id })
                    }
                })
            }
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
            host: 'premium73.web-hosting.com',
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
            html: `<body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">Verification Code</h2>
            <p>Enter this code to verify your account</p>
            <p style="font-size: 50; font-weight: 800">${otp}</p>
            <p>You can ignore this message if you didn't request this code.</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
    </body>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
            }
            res.status(200).json({ message: "OTP sent to user's email address", token: user.passwordResetToken })
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
        const transporter = nodemailer.createTransport({
            host: 'premium73.web-hosting.com',
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
            subject: 'Password Changed Successfully',
            html: `
<body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">You have successfully change your email</h2>
            <p style="color:red;">Please contact our support if you are not trying to change your email</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
</body>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
                res.status(200).json({ message: "Email Changed Successfully" })
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
        console.log(error)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body
        const user = await User.findOne({ passwordResetToken: otp })
        if (!user) return res.status(401).json({ message: 'Invalid OTP' })
        res.status(200).json({ message: 'OTP verified' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const resetPassword = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const { password } = req.body
        const user = await User.findOne({ passwordResetToken: token })
        if (!user) return res.status(401).json({ message: 'User not found' })
        user.password = bcrypt.hashSync(password, 10)
        user.passwordResetToken = null
        await user.save()
        const transporter = nodemailer.createTransport({
            host: 'mail.phinol.com',
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
            subject: 'Password Changed Successfully',
            html:
                `
<body style="
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #101010;
    color: #e1e1e1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  ">
    <main style="padding: 1.5em;">
        <div style="
        margin-top: 1em;
        padding: 0.1em 1em;
        background-color: #e1e1e1;
        color: #101010;
        font-size: 10px;
        font-weight: 400;
        width:300px;
      ">
            <header style="margin-top:10px">
                <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                        src="https://phinol.com/images/logo.png" alt=""
                        style="width: 50px; height: 50px; object-fit: contain" /></a>
            </header>
            <h2 style="font-size: 12px">You have successfully change your password</h2>
            <p style="color:red;">Please contact our support if you are not trying to change your password</p>
            <p>For Further enquiry, checkout our <a href="">FAQ</a> or you can contact our <a href="" target="_blank"
                    rel="noopener noreferrer">SUPPORT</a></p>
            <div style="margin-top: 40px;font-size: 10px; color: #101010">
                <hr />
                <div style="display:flex; justify-content: space-between; align-items:center;">
                    <p><b>Phinol Team</b></p>
                    <a href="http://phinol.com" target="_blank" rel="noopener noreferrer"><img
                            src="https://phinol.com/images/logo.png" alt=""
                            style="width: 20px; height: 20px; object-fit: contain" /></a>
                </div>
            </div>
        </div>
    </main>
</body>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
                res.status(200).json({ message: "Password Changed Successfully" })
            }
        })
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
            res.status(200).json({ message: 'Wallet fetched successfully', USDT: Body.data[3].balance, BTC: Body.data[2].balance, ETH: Body.data[6].balance, BNB: Body.data[7].balance, MATIC: Body.data[15].balance, DOT: Body.data[19].balance, LINK: Body.data[20].balance, CAKE: Body.data[21].balance, ADA: Body.data[25].balance, SOL: Body.data[30].balance })
        })
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
    let currency = ['qdx', 'usd', 'btc', 'usdt', 'busd', 'usdc', 'eth', 'bnb', 'xrp', 'ltc', 'wkd', 'bch', 'dash', 'doge', 'trx', 'matic', 'sfm', 'aave', 'shib', 'dot', 'link', 'cake', 'xlm', 'axs', 'fil', 'ada', 'one', 'babydoge', 'xtz', 'floki', 'sol']
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
            let currency = ['qdx', 'usd', 'btc', 'usdt', 'busd', 'usdc', 'eth', 'bnb', 'xrp', 'ltc', 'wkd', 'bch', 'dash', 'doge', 'trx', 'matic', 'sfm', 'aave', 'shib', 'dot', 'link', 'cake', 'xlm', 'axs', 'fil', 'ada', 'one', 'babydoge', 'xtz', 'floki', 'sol']
            const length = currency.length
            for (let i = 0; i < length; i++) {
                obj[currency[i]] = Body.data[i].deposit_address
            }
            addresses.push(obj)
            user.addresses = addresses
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
        res.status(200).json({ message: 'OTP verified successfully', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
    } else {
        res.status(401).json({ message: 'OTP verification failed' })
    }
}

const disableOTP = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { otp } = req.body
    const email = decoded.email
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'User not found' })
    const verified = speakeasy.totp.verify({
        secret: user._2faAscii,
        encoding: 'ascii',
        token: otp
    })
    if (verified) {
        user._2faEnabled = false
        user.save()
        res.status(200).json({ message: 'OTP disabled successfully', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
    } else {
        res.status(401).json({ message: 'OTP verification failed' })
    }
}

const biometric = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '12h' })
        res.status(200).json({ message: 'User logged in', email: user.email, phinolID: user.phinolID, firstName: user.firstName, lastName: user.lastName, tfaEnabled: user._2faEnabled, addresses: user.addresses, verified: user.verified, phin: user.phinBalance, referralCode: user.user_id, referrals: user.referralCount, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const phinBalance = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        const streak = await Streak.findOne({ user: user._id })
        if (!streak) {
            const newStreak = new Streak({
                user: user._id,
                streak: 0,
            })
            await newStreak.save()
        }
        res.status(200).json({ message: 'Phin balance Retrieved', phin: user.phinBalance, streak: streak.streak })
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

const createWallet = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const email = decoded.email
        const user = await User.findOne({ email: email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        let currency = ['qdx', 'usd', 'btc', 'usdt', 'busd', 'usdc', 'eth', 'bnb', 'xrp', 'ltc', 'wkd', 'bch', 'dash', 'doge', 'trx', 'matic', 'sfm', 'aave', 'shib', 'dot', 'link', 'cake', 'xlm', 'axs', 'fil', 'ada', 'one', 'babydoge', 'xtz', 'floki', 'sol']
        const length = currency.length
        for (let i = 0; i < length; i++) {
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/wallets/${currency[i]}/addresses`,
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                }
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
            });
        }
        res.status(200).json({ message: 'Wallet created successfully', email: user.email, firstName: user.firstName, lastName: user.lastName, addresses: [], verified: user.verified, user: user.user_id, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
module.exports = { register, createWallet, login, phinBalance, saveWallet, biometric, verifyOtp, resendOTP, changePassword, verifyUser, forgotPassword, resetPassword, viewWalletBalance, google, viewAddresses, generateOTP, verifyOTP, validateOTP, disableOTP, changeEmail }