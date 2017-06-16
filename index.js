let express = require('express');
let app = express();
let server = require('http').Server(app);
let bodyParser = require('body-parser');
let expressSession = require('express-session');

const app_api_key = process.env.WEBHOOKS_APP_API_KEY;
const access_key = process.env.WEBHOOKS_ACCESS_KEY;
const api_signing_key = process.env.WEBHOOKS_API_SIGNING_KEY;
const webhook_signing_key = process.env.WEBHOOKS_SIGNING_KEY;
const port = process.env.WEBHOOKS_PORT || 3000;

/**
 * Setting PROD to true calculate a unique nonce every time
 * Setting DEBUG to true outputs everything that is going on.
 * @type {{PROD: boolean, DEBUG: boolean}}
 */
let options = {
    PROD: true,
    DEBUG: false,
    API_URL: 'https://api.authy.com'
};

let webhooks = require('./webhooks-api.js')(app_api_key, access_key, api_signing_key, options);
let router = express.Router();

app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expressSession({'secret': 'SECRETMAN!'}));

/**
 * Simple in-memory object holding onto the webhook response.
 */
let webhookInMemory = {
    raw: '',
    unique: 0,
    verified: false,
    decoded: ''
};

/**
 * Check if the unique values are different.  If so, return the new webhook information.
 */
router.route('/webhook').post(function (req, res) {
    if(req.body.unique !== webhookInMemory.unique){
        res.json(webhookInMemory);
    } else {
        res.status(500).send();
    }
});

/**
 * Webhook endpoint.  We set the data and add a unique identifier
 */
router.route('/webhooked').post(function (req, res) {

    webhookInMemory.raw = req.body.body;
    webhookInMemory.unique =  parseInt(Math.random().toString(36).substring(7), 10);

    try {
        webhookInMemory.decoded = webhooks.verifyJWTResponse(webhookInMemory.raw, webhook_signing_key);
        console.log('Signature verified and decoded');
        webhookInMemory.verified = true;
    } catch (err) {
        console.log('Invalid signature. Cannot verify JWT');
        console.log(err);
        return false;
    }

    res.status(200).send();
});

/**
 * Prefix all router calls with 'api'
 */
app.use('/api', router);
app.use('/', express.static(__dirname + '/server/public'));

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

