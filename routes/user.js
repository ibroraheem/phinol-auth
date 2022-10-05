const express = require('express');
const router = express.Router();
require('../controllers/google')
const passport = require('passport')

const { register, login, verifyUser, verifyPhoneNumber, updateUser } = require('../controllers/user');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-user/', verifyUser);
router.post('/update-user/', updateUser);
router.post('/verify-phone-number/', verifyPhoneNumber);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/profile');
});


module.exports = router;
