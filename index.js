const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cookieParser = require('cookie-parser')
require('dotenv').config();

const connectDB = require('./config/db');

app.use(morgan('tiny'))
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.use(cookieParser('secret'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    origin: '*'
}));

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

