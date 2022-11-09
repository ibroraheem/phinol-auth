const express = require('express');
const router = express.Router();
const { register, login, verifyUser, saveWallet, changePassword, resendOTP, forgotPassword, resetPassword, google, viewWalletBalance, viewAddresses, generateOTP, verifyOTP, validateOTP, disableOTP } = require('../controllers/user');
const { validateAddress, sendCrypto } = require('../controllers/send');
const { getDeposit, getDeposits } = require('../controllers/deposit')
const {reward} = require('../controllers/streak')
router.post('/register', register);
router.post('/login', login);
router.post('/verify-user/', verifyUser);

// router.post('/verify-phone-number/', verifyPhoneNumber);`
router.post('/resend-otp/', resendOTP);
router.post('/google', google);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/wallet-balance', viewWalletBalance);
router.get('/view-addresses', viewAddresses);
router.post('/resend-otp', resendOTP);
router.post('/save-wallet', saveWallet);
router.post('/validate-address', validateAddress);
router.get('/deposits', getDeposits);
router.get('/deposits/:deposit_id', getDeposit);
router.post('/change-password', changePassword);
router.post('/daily-reward', reward);
router.post('/send-crypto', sendCrypto);
router.post('/generate-otp', generateOTP);
router.post('/verify-otp', verifyOTP);
router.post('/validate-otp', validateOTP);
router.post('/disable-otp', disableOTP);

module.exports = router;
