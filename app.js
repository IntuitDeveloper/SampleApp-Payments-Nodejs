'use strict';

require('dotenv').config();

const express = require('express');
const request = require('request');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const uuidv1 = require('uuid/v1');
const ngrok =  (process.env.NGROK_ENABLED==="true") ? require('ngrok'):null;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, '/public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(bodyParser.json())

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var chargeID='';

app.use(express.static('views'));

app.get('/', function(req, res) {

    // Render home page with params
    res.render('index');
});

app.post('/authorizePurchase', urlencodedParser,  function(req,res) {

    var postBody = {
        url: process.env.CHARGE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Request-Id' : uuidv1(),
            'Authorization' : 'Bearer ' + process.env.ACCESS_TOKEN
        },
        body: req.body.json,
        json: true
    };

    request.post(postBody, function (err, response) {
        chargeID = response.body.id;
        res.send(response.body);
    });


});

app.post('/captureCharge', urlencodedParser, function(req,res) {

    var postBody = {
        url: process.env.CHARGE_URL +'/'+ chargeID +'/capture',
        headers: {
            'Content-Type': 'application/json',
            'Request-Id' : uuidv1(),
            'Authorization' : 'Bearer ' + process.env.ACCESS_TOKEN
        },
        body: req.body.json,
        json: true
    };

    request.post(postBody, function (err, response, data) {
        res.send(response.body);
    });

});


// Start server on HTTP
const server = app.listen(process.env.PORT || 8000, () => {
    console.log(`💻 Server listening on port ${server.address().port}`);
    if(!ngrok){
        console.log(`💳  See the Sample App in your browser: ` + 'http://localhost:' + `${server.address().port}`);
    }

});

// Turn on the ngrok tunnel in development, which provides both the mandatory HTTPS support for all card payments
if (ngrok) {
    console.log("NGROK Enabled");
    ngrok.connect(
        {
            addr: process.env.PORT || 8000,
            subdomain: '',
            authtoken: '',
        },
        (err, url) => {
            if (err) {
                if (err.code === 'ECONNREFUSED') {
                    console.log(`Connection refused at ${err.address}:${err.port}`);
                } else {
                    console.log(`⚠️  ${err}`);
                }
                process.exit(1);
            } else {
                console.log(`💳  See the Sample App in your browser: ${url}`);
            }
        }
    );
}