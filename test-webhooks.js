const util = require('util')

/**
 * Use this code to test the dashboard API.
 * Uncomment specific calls below to test them.  Only test on a non-production sites.
 */

const app_api_key = process.env.WEBHOOKS_APP_API_KEY;
const access_key = process.env.WEBHOOKS_ACCESS_KEY;
const api_signing_key = process.env.WEBHOOKS_API_SIGNING_KEY;

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

if (!webhooks) {
    console.log("You need to setup the API keys in demo.env then `source demo.env`");
    console.log("You can find these API keys in your Authy Dashboard under the API keys section.");
    console.log("If the 3 keys are not present, you need to create a ticket requesting them to be enabled");
    process.exit(1);
}


/**
 * Create Webhook
 *
 * Below are the public events you can create webhooks for.
 *
 * account_recovery_approved
 * account_recovery_canceled
 * account_recovery_started
 * custom_message_not_allowed
 * device_registration_completed
 * one_touch_request_responded
 * phone_change_canceled
 * phone_change_pin_sent
 * phone_change_requested
 * phone_verification_code_is_invalid
 * phone_verification_code_is_valid
 * phone_verification_failed
 * phone_verification_not_found
 * phone_verification_started
 * suspended_account
 * token_invalid
 * token_verified
 * too_many_code_verifications
 * too_many_phone_verifications
 * totp_token_sent
 * user_added
 * user_phone_changed
 * user_removed
 */

let webhook_url = 'https://[YOUR_NGROK_HERE]/api/webhooked';
let events = ['phone_verification_started'];
let name = 'phone_verification_started';
// webhooks.createWebhooks(events, webhook_url, name);

/**
 * Delete Webhook
 */
let webhook_id = "WH_#####";
// webhooks.deleteWebhook(webhook_id);


/**
 * Verify Webhook
 * 
 * The signing key should be available alongside your other webhook information when listing your webhooks.
 */
let webhook_signing_key = '';
let encoded_message = '';
// let decoded = webhooks.verifyJWTResponse(encoded_message, webhook_signing_key);
// console.log(util.inspect(decoded, false, null));

/**
 * List Webhooks
 */
webhooks.listWebhooks();
