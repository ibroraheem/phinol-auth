const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    console.log("MongoDB Connected")
}

module.exports = connectDB;