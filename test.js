const request = require('request');
require('dotenv').config();

// const options = {
//     method: 'GET',
//     url: 'https://www.quidax.com/api/v1/users/sbdya6nn/wallets',
//     headers: {
//         accept: 'application/json',
//         Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
//     }
// };

// request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     const Body = JSON.parse(body);
//     let addresses = [];
//     let obj = {}
//     obj['btc'] = Body.data[3].deposit_address
//     obj['usdt'] = Body.data[4].deposit_address
//     obj['eth'] = Body.data[7].deposit_address
//     obj['bnb'] = Body.data[8].deposit_address
//     addresses.push(obj)
//     console.log(addresses)
// });

// const data = {
//     "to": "+2349066730744",
//     "from": "Phinol",
//     "sms": "Hi there, testing Termii",
//     "type": "plain",
//     "api_key": process.env.SMS_TOKEN,
//     "channel": "generic"
// };
// const options = {
//     'method': 'POST',
//     'url': 'https://api.ng.termii.com/api/sms/send',
//     'headers': {
//         'Content-Type': ['application/json', 'application/json']
//     },
//     body: JSON.stringify(data)

// };
// request(options, function (error, response) {
//     if (error) throw new Error(error);
//     console.log(response.body);
// });



// const request = require('request');

// const options = {
//     method: 'POST',
//     url: 'https://www.quidax.com/api/v1/users/sbdya6nn/orders',
//     headers: {
//         accept: 'application/json',
//         'content-type': 'application/json',
//         Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
//     },
//     body: { market: 'bnbusdt', side: 'buy', ord_type: 'market', volume: '0.018' },
//     json: true
// };

// request(options, function (error, response, body) {
//     if (error) throw new Error(error);

//     console.log(body);
// });



    // const options = {
    //     method: 'GET',
    //     url: 'https://www.quidax.com/api/v1/users/mhegp54z/wallets',
    //     headers: {
    //         accept: 'application/json',
    //         Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
    //     }
    // };

    // request(options, function (error, response, body) {
    //     if (error) throw new Error(error);
    //     const Body = JSON.parse(body);
    //     let addresses = [];
    //     let obj = {}
    //     obj['btc'] = Body.data[3].deposit_address
    //     obj['usdt'] = Body.data[4].deposit_address
    //     obj['eth'] = Body.data[7].deposit_address
    //     obj['bnb'] = Body.data[8].deposit_address
    //     addresses.push(obj)
    //     console.log(addresses)
    // })



const options = {
    method: 'GET',
    url: 'https://www.quidax.com/api/v1/users/gemy5mdx/wallets',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer kabQxIAoJuu1Jwl9DKTulyjxcblEOB4VdixcUE3i'
    }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);
    const Body = JSON.parse(body);
    console.log(Body.data);
});




// {
//     "data": {
//         "id": "bvcjzqgf",
//             "reference": null,
//                 "market": {
//             "id": "bnbusdt",
//                 "base_unit": "BNB",
//                     "quote_unit": "USDT"
//         },
//         "side": "buy",
//             "order_type": "market",
//                 "price": {
//             "unit": "USDT",
//                 "amount": null
//         },
//         "avg_price": {
//             "unit": "USDT",
//                 "amount": "0.0"
//         },
//         "volume": {
//             "unit": "BNB",
//                 "amount": "0.017"
//         },
//         "origin_volume": {
//             "unit": "BNB",
//                 "amount": "0.017"
//         },
//         "executed_volume": {
//             "unit": "BNB",
//                 "amount": "0.0"
//         },
//         "status": "wait",
//             "trades_count": 0,
//                 "created_at": "2022-10-17T15:08:13.123+01:00",
//                     "updated_at": "2022-10-17T15:08:13.123+01:00",
//                         "done_at": null,
//                             "user": {
//             "id": "sbdya6nn",
//                 "sn": "QDXDSYPJ5SF",
//                     "email": "opeibrahim@gmail.com",
//                         "reference": null,
//                             "first_name": "Ibrahim",
//                                 "last_name": "Abdulraheem",
//                                     "display_name": null,
//                                         "created_at": "2022-10-06T12:55:35.000+01:00",
//                                             "updated_at": "2022-10-06T13:35:29.000+01:00"
//         },
//         "trades": []
//     }
// }


const parentID = xc57w34g

const options = {
    method: 'POST',
    url: `https://www.quidax.com/api/v1/users`,
    headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
    },
    body: {
        email: user.phinolMail
    },
    json: true
}
request(options, (error, response) => {
    if (error) throw new Error(error)
    const Body = JSON.parse(response.body)
    user.user_id = Body.data.id
    user.save()
    res.status(200).json({ message: "User verified successfully" })
})


 const currency = ['btc', 'eth', 'bnb', 'usdt']
                    currency.forEach(async (item) => {
                        const options = {
                            method: 'POST',
                            url: `https://www.quidax.com/api/v1/wallets`,
                            headers: {
                                accept: 'application/json',
                                'content-type': 'application/json',
                                Authorization: `Bearer ${process.env.QUIDAX_API_SECRET}`
                            },
                        }