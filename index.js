const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const passport = require('passport')
const session = require('express-session')
const cookieParser = require('cookie-parser')
require('dotenv').config();

const connectDB = require('./config/db');

app.use(morgan('tiny'))
app.use(session({
    secret: process.env.secret,
    resave: true,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use(cookieParser('secret'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

connectDB()



app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/admin', require('./admin'));
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
);
app.get('/profile', (req, res) => {
    req.session.user = req.user;
    res.json({ email: req.session.user.email })

})

app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/",
        successRedirect: "/profile",
    })
);
app.use('/', require('./routes/user'));

const port = process.env.PORT
app.listen(port, () => {
    console.log('Listening on ' + port);
})

