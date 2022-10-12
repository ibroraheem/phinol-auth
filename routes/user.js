const express = require('express');
const router = express.Router();



const { register, login, verifyUser, saveWallet, updateUser, resendOTP, forgotPassword, resetPassword, google, viewWalletBalance, viewAddresses } = require('../controllers/user');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-user/', verifyUser);
router.patch('/update-user/', updateUser);
// router.post('/verify-phone-number/', verifyPhoneNumber);
router.post('/resend-otp/', resendOTP);
router.post('/google', google);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/wallet-balance', viewWalletBalance);
router.get('/view-addresses', viewAddresses);
router.post('/resend-otp', resendOTP);
router.post('/save-wallet', saveWallet)

module.exports = router;
