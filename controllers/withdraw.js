const User = require("../models/user");
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
        if (dollarValue < 10) {
            return res.status(401).json({ message: 'You cannot withdraw less $10' })
        }
        if (currency === 'btc') {
            const withdrawAmount = Number(amount) - 0.00005
            const profit = "0.00005"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'bnb') {
            const withdrawAmount = Number(amount) - 0.000375
            const profit = "0.000375"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'usdt') {
            const withdrawAmount = Number(amount) - 0.2
            const profit = "0.2"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'sol') {
            const withdrawAmount = Number(amount) - 0.005
            const profit = "0.005"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'doge') {
            const withdrawAmount = Number(amount) - 2
            const profit = "2"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'xrp') {
            const withdrawAmount = Number(amount) - 0.12
            const profit = "0.12"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else if (currency === 'link') {
            const withdrawAmount = Number(amount) - 0.25
            const profit = "0.25"
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
                    amount: withdrawAmount.toString(),
                    fund_uid: address
                },
                json: true
            }
            request(options, function (error, response, body) {
                if (error) throw new Error(error)
                if (body.status === 'success') {
                    const options = {
                        method: 'POST',
                        url: `https://www.quidax.com/api/v1/users/${user.user_id}/withdraws/$`,
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
                        if (error) throw new Error(error)
                        if (body.status === 'success') {
                            return res.status(200).json({ message: 'Withdrawal successful' })
                        }
                    })
                }
            })
        } else {
            res.status(400).json({ message: 'Invalid currency' })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message })

    }
}

module.exports = { withdraw }

