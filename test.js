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