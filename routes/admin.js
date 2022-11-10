const express = require('express');
const router = express.Router();

const { register, login, forgotPassword, resetPassword, getAllUsers, getUser, grantAccess, revokeAccess } = require('./controllers/admin');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users', getAllUsers);
router.get('/users/:id', getUser);
router.post('/users/:id/grant-access', grantAccess);
router.post('/users/:id/revoke-access', revokeAccess);

module.exports = router;