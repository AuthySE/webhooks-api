const qs = require('qs');
const crypto = require('crypto');
const exec = require('child_process').exec;
const n = require('nonce')();
const jwt = require('jsonwebtoken');

module.exports = function (app_api_key, access_key, signing_key, options) {
    if (!app_api_key || !access_key || !signing_key) {
        return false;
    } else {
        return new AuthyWebhooks(app_api_key, access_key, signing_key, options);
    }
};


function AuthyWebhooks(app_api_key, access_key, signing_key, options) {
    this.DEBUG = options.DEBUG || false;
    this.PROD = options.PROD || true;
    this.api_url = options.API_URL;
    this.app_api_key = app_api_key;
    this.access_key = access_key;
    this.signing_key = signing_key;

    this.nonce = options.PROD ? n() + "." + n() : 123;
    this.computed_sig;

}


/**
 * Sort by property only.
 *  Normal JS sort parses the entire string so a stringified array value like 'events=zzzz'
 *  would be moved after 'events=aaaa'.
 *
 *  Instead we split tokenize the string around the '=' value and only sort alphabetically
 *  by the property.
 *
 * @param {string} x
 * @param {string} y
 * @returns {number}
 */
function sortByPropertyOnly(x, y) {
    var xx = x.split("=");
    var yy = y.split("=");

    if (xx < yy) {
        return -1;
    }
    if (xx > yy) {
        return 1;
    }
    return 0;
}


AuthyWebhooks.prototype = {

    /**
     * Call the CURL command
     * @param curl
     */
    callCurl: function (curl) {
        if (this.DEBUG) {
            console.log("cURL call:\n", curl);
        }

        console.log("CURL COMMAND:");
        console.log(curl);

        exec(curl, (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
    },

    /**
     * Compute the HMAC sig based upon the API keys, payload params, method, url and a nonce.
     *
     * @param {!string} url
     * @param {!string} method   POST || GET
     * @param {Object=} params  Any additional params.
     */
    computeSig: function (url, method, params) {
        var allParams = {
            app_api_key: this.app_api_key,
            access_key: this.access_key
        };

        // add any additional params
        for (var key in params) {
            allParams[key] = params[key];
        }

        if (this.DEBUG) console.log("Params:\n", allParams);

        var sorted_params = qs.stringify(allParams, {arrayFormat: 'brackets'}).split("&").sort(sortByPropertyOnly).join("&").replace(/%20/g, '+');

        if (this.DEBUG) console.log("Sorted: \n", sorted_params);

        var dataToSign = this.nonce + "|" + method + "|" + url + "|" + sorted_params;

        this.computed_sig = crypto.createHmac('sha256', this.signing_key).update(dataToSign).digest('base64');


        if (this.DEBUG) {
            console.log("Nonce:\n", this.nonce);
            console.log("Signature:\n", this.computed_sig);
        }
    },


    deleteWebhook: function (id) {
        if (!id) {
            console.log('webhook id required');
            return false;
        }
        var url = this.api_url + "/dashboard/json/application/webhooks/" + id;
        var method = "DELETE";

        // extra params for sig computation
        var params = {
        };

        this.computeSig(url, method, params);
        var curl = 'curl -X DELETE ' + url
            + ' -d app_api_key=' + this.app_api_key
            + ' -d access_key=' + this.access_key
            + ' -H "X-Authy-Signature-Nonce:' + this.nonce + '"'
            + ' -H "X-Authy-Signature: ' + this.computed_sig + '"';

        this.callCurl(curl);

    },

    listWebhooks: function () {
        var url = this.api_url + "/dashboard/json/application/webhooks";
        var method = "GET";

        this.computeSig(url, method);
        var curl = 'curl -X GET ' + url
            + ' -d app_api_key=' + this.app_api_key
            + ' -d access_key=' + this.access_key
            + ' -H "X-Authy-Signature-Nonce:' + this.nonce + '"'
            + ' -H "X-Authy-Signature: ' + this.computed_sig + '"';

        this.callCurl(curl);
    },

    /**
     * {Array.<strings>} events
     */
    createWebhooks: function (events, callback_url, name) {
        var url = this.api_url + "/dashboard/json/application/webhooks";
        var method = "POST";


        if (events.length < 1 || !callback_url || !name) {
            console.log('no events or no callback or webhook name');
            return false;
        }
        var webhook_events = '';

        for (var i = 0; i < events.length; i++) {
            webhook_events += ' -d events[]="' + events[i] + '" '
        }

        // extra params for sig computation
        var params = {
            app_api_key: this.app_api_key,
            access_key: this.access_key,
            url: callback_url,
            events: events,
            name: name
        };

        this.computeSig(url, method, params);

        var curl = 'curl -X POST ' + url
            + ' -d url="' + callback_url + '"'
            + ' -d name="' + name + '"'
            + webhook_events
            + ' -d app_api_key="' + this.app_api_key + '"'
            + ' -d access_key="' + this.access_key + '"'
            + ' -H "X-Authy-Signature-Nonce:' + this.nonce + '"'
            + ' -H "X-Authy-Signature: ' + this.computed_sig + '"';

        this.callCurl(curl);
    },

    verifyJWTResponse: function (message, secret) {

        try {
            var decoded = jwt.verify(message, secret, {algorithm: ["HS256"]});
            console.log('Signature verified and decoded');
            return decoded;
        } catch (err) {
            console.log('Invalid signature. Cannot verify JWT');
            console.log(err);
            return false;
        }
    }
};
