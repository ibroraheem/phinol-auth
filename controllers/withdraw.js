const User = require("../models/user");
const History = require("../models/history");
const jwt = require('jsonwebtoken')
const request = require('request')
require('dotenv').config()



const withdraw = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const { currency, amount, address, dollarValue } = req.body
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ email: decoded.email })
        if (!user) return res.status(401).json({ message: 'User not found' })
        if (Number(dollarValue) < 10) {
            return res.status(401).json({ message: 'You cannot withdraw less $10' })
        }
        if (currency === 'usdt') {
            const withdrawAmount = (Number(amount) - 0.2).toString()
            const profit = "0.2"
            const fee = "1.2"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                console.log(body);
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        console.log(body);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            History.create({
                                user_id: user._id,
                                txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                                quidaxID: body.data.id,
                                currency: currency,
                                fee: `1.2 ${currency}}`,
                                receivable_amount: `${String(Number(amount) - Number(fee))}`,
                                status: 'successful',
                            })
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'btc') {
            const withdrawAmount = (Number(amount) - 0.00005).toString()
            const profit = "0.00005"
            const fee = "0.00025"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                console.log(body);
                if (body.status === 'success') {
                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        console.log(body);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'bnb') {
            const withdrawAmount = (Number(amount) - 0.000375).toString()
            const profit = "0.000375"
            const fee = "0.001125"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === 'success') {

                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'sol') {
            const withdrawAmount = (Number(amount) - 0.005).toString()
            const profit = "0.005"
            const fee = "0.015"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === 'success') {

                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'xrp') {
            const withdrawAmount = (Number(amount) - 0.12).toString()
            const profit = "0.12"
            const fee = "0.24"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === 'success') {
                    History.create({
                        user_id: user._id,
                        quidaxID: body.data.id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        console.log(body);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'link') {
            const withdrawAmount = (Number(amount) - 0.25).toString()
            const profit = "0.25"
            const fee = "2.25"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                if (body.status === 'success') {
                    generateId(6)
                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else if (currency === 'ada') {
            const withdrawAmount = (Number(amount) - 0.25).toString()
            const profit = "0.25"
            const fee = "1.25"
            const options = {
                method: 'POST',
                url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                },
                body: {
                    currency: currency,
                    amount: withdrawAmount,
                    fund_uid: address
                },
                json: true
            };
            request(options, function (error, response, body) {
                if (error) throw new Error(error);

                if (body.status === 'success') {
                    History.create({
                        user_id: user._id,
                        txID: `${(Math.random() + 1).toString(36).substring(2)}`,
                        quidaxID: body.data.id,
                        currency: currency,
                        fee: `${fee} ${currency}}`,
                        receivable_amount: `${String(Number(amount) - Number(fee))}`,
                        status: 'successful',
                    })
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws`,
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/json',
                            Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                        },
                        body: {
                            currency: currency,
                            amount: profit,
                            fund_uid: 'xc57w34g'
                        },
                        json: true
                    }
                    request(options, function (error, response, body) {
                        if (error) throw new Error(error);
                        if (body.status === 'success') {
                            user.phinBalance.withdrawal += Number(dollarValue) / 100;
                            user.phinBalance.total += Number(dollarValue) / 100;
                            user.save()
                            res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                } else {
                    res.status(400).json({ message: "Insufficient Balance" })
                }
            })
        } else {
            res.status(400).json({ message: 'Invalid currency' })
        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = { withdraw }

