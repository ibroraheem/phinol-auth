const express = require('express');
const router = express.Router();

const { register, login, forgotPassword, resetPassword } = require('../controllers/admin');
const {withdraw} = require('../test')

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/withdraw', withdraw);

module.exports = router;