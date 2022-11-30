const Admin = require('../models/admin')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const User = require('../models/user')

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

const getAllUsers = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decoded.adminId)
        if (!admin) return res.status(404).json({ error: 'Admin not found' })
        if(admin.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })
        const users = await User.find()
        res.status(200).json({ users })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const getUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decoded.adminId)
        if (!admin) return res.status(404).json({ error: 'Admin not found' })
        if(admin.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })
        const user = await User.findById(req.params.id)
        res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const revokeAccess = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decoded.adminId)
        if (!admin) return res.status(404).json({ error: 'Admin not found' })
        if (admin.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        await User.findOneAndUpdate({ _id: req.params.id }, { access: false })
        res.status(200).json({ message: 'Access revoked' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const grantAccess = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findById(decoded.adminId)
        if (!admin) return res.status(404).json({ error: 'Admin not found' })
        if (admin.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' })
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        await User.findOneAndUpdate({ _id: req.params.id }, { access: true })
        res.status(200).json({ message: 'Access granted' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { register, login, forgotPassword, resetPassword, getAllUsers, getUser, revokeAccess, grantAccess }

