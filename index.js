const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const cookieParser = require('cookie-parser')
require('dotenv').config();
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const swaggerOptions = {
    explorer: true,
};
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
app.use(express.json());
app.use(cors({
    origin: '*'
}));

connectDB()



app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument, swaggerOptions));
app.use('/admin', require('./routes/admin'));

app.use('/', require('./routes/user'));
app.use('/', require('./routes/trade'));
app.use('/', require('./routes/withdraw'));

const port = process.env.PORT
app.listen(port, () => {
    console.log('Listening on ' + port);
})

