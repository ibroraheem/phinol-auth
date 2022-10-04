const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile.emails[0].value);
        User.findOne({ email: profile.emails[0].value }).then(user => {
            if (user) {
                return cb(null, user);
            } else {
                const newUser = new User({
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    password: profile.id,
                    verified: true,
                })
                accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
                newUser.save().then(user => {
                    return cb({null: null, user: user.email, token: accessToken});
                })
            }
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;