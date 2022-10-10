const express = require('express');
const router = express.Router();
require('../controllers/google')
const passport = require('passport')

const { register, login, verifyUser, postAddress, verifyPhoneNumber, updateUser, forgotPassword, resetPassword, google, createWallet, viewWalletBalance, viewAddresses } = require('../controllers/user');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-user/', verifyUser);
router.post('/update-user/', updateUser);
router.post('/verify-phone-number/', verifyPhoneNumber);
// router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//     res.redirect('/profile');
//     // });
router.post('/google', google);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/create-wallet', createWallet);
router.post('/post-address', postAddress);
router.get('/wallet-balance', viewWalletBalance);
router.get('/view-addresses', viewAddresses);

module.exports = router;
