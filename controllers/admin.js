const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')

const register = async (req, res) => {
    const { email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 10)
    try {
        const notRegistered = await Admin.countDocuments === 0
        if (!notRegistered) return res.status(400).json({ error: 'Admin already registered' })
        const admin = await Admin.create({ email, password: hashedPassword })
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.status(201).json({message: 'Registration successful', user: admin.email, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' })
        }
        const passwordIsValid = bcrypt.compareSync(password, admin.password)
        if (!passwordIsValid) {
            res.status(401).json({ error: 'Invalid password' })
        }
        const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })
        res.status(200).json({message:'Login successful', user: admin.email, token: token })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' })
        }
        const passwordResetToken = Math.floor(100000 + Math.random() * 900000)
        await Admin.findOneAndUpdate({ email }, { passwordResetToken })
        // const transporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: process.env.EMAIL,
        //         pass: process.env.PASSWORD
        //     }
        // })
        // const mailOptions = {
        //     from: process.env.EMAIL,
        //     to: email,
        //     subject: 'Password Reset',
        //     html: `<h1>Use this code to reset your password</h1>
        //     <h2>${passwordResetToken}</h2>`
        // }
        // transporter.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log(error)
        //     } else {
        //         console.log('Email sent: ' + info.response)
        //     }
        // })
        res.status(200).json({ message: 'Password reset link sent to your email' })
    } catch (error) {
        res.status(500).json({ error: error.message })

    }
}

const resetPassword = async (req, res) => {
    const { email, passwordResetToken, newPassword } = req.body
    try {
        const admin = await Admin.findOne({ email })
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' })
        }
        if (passwordResetToken !== admin.passwordResetToken) {
            res.status(400).json({ error: 'Invalid token' })
        }
        const hashedPassword = bcrypt.hashSync(newPassword, 10)
        await Admin.findOneAndUpdate({ email }, { password: hashedPassword })
        res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { register, login, forgotPassword, resetPassword }

