const request = require('request');
const withdraw = async (req, res) => {
    const { currency, amount } = req.body
    try {
        const options = {
            method: 'POST',
            url: 'https://www.quidax.com/api/v1/users/3iugjrxz/withdraws',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
            },
            body: {
                currency: currency,
                amount: amount,
                fund_uid: 'xc57w34g'
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
            if (body.status === 'success') {
                res.status(200).json({ message: 'Withdrawal successful' })
            } else {
                res.status(400).json({ message: body.message })
            }
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = { withdraw }

