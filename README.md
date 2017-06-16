# Authy Webhook API Examples
This repo demonstrates how to Create, List, Delete Authy webhooks.  You can set a webhook to be called after a publically visible event (listed below). Webhooks use a `POST` when responding.  This code also demonstrates how to sign a request and verify the signature in a response.

Official documentation may be found here:
[https://www.twilio.com/docs/api/authy/authy-webhooks-api](https://www.twilio.com/docs/api/authy/authy-webhooks-api)

### Setup Environment
1. Clone this repo
2. `npm install`
3. Browse to the application you want to use in the twilio.com/console where (once enabled) you should now see:
    * App API Key
    * Your Access Key
    * API Signing Key
    * Authy API Key
5. Add the above keys to `demo.env`
6. Add a Country Code and Phone Number to `demo.env` as well.  WEBHOOKS_COUNTRY && WEBHOOKS_PHONE
6. `source demo.env`

### Setup Webhook
1. Uncomment the 'createWebhooks' call in `test-webhooks.js`
2. Add the webhook url, event type and name for this webhook variables
    * `let webhook_url = 'https://[YOUR_NGROK_SUB_DOMAIN].ngrok.io/api/webhooked';`
    * `let events = ['phone_verification_started'];`
    * `let name = 'phone_verification_started';`
3. `node test-webhooks.js` to set the webhook
    * You can list all of the webhooks by uncommenting the listWebhooks call at the bottom of test-webhooks.js
4. If set successfully, there should be a `signing_key` starting with `WSK_`
5. Save this signing key in the `demo.env` file as the WEBHOOKS_SIGNING_KEY
6. `source demo.env`

### Setup Local Listening Environment
1. Run `npm install` (if you haven't already)
2. Run `node index.js` to start the local web server on your port
3. Run `ngrok http -subdomain=[YOUR_NGROK_SUB_DOMAIN] [YOUR_LOCAL_PORT]`
4. Browse to `YOUR_NGROK_SUB_DOMAIN.ngrok.io`
5. Trigger an event to see the webhook in action.  You'll need to execute an appropriate action for the event you want to see triggered.  The easiest may be Phone Verification.  You can find additional cURL scripts [here](https://github.com/AuthySE/Authy-API-Samples).
6. Run `example_curl.sh` or the code snippet below
```
curl -X POST "https://api.authy.com/protected/json/phones/verification/start? \
      via=sms&country_code=$WEBHOOKS_COUNTRY&phone_number=$WEBHOOKS_PHONE" \
      -H "X-Authy-API-Key: $WEBHOOKS_AUTHY_API_KEY"
```

## Public Webhook Events
You can trigger webhooks using the following events.  You can use multiple events in a single webhook.

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

### Listing Webhooks
```javascript
webhooks.listWebhooks();
```
*Response:*
```json
{"webhooks":[{
    "id":"WH_#####-#####",
    "name":"name_of_webhook",
    "account_sid":"AC######",
    "service_id":"###",
    "url":"https://YOUR_SITE/API/WEBHOOK_ENDPOINT",
    "signing_key":"SIGNING_KEY",
    "events":["user_added"]
}]}
```

### Create Webhooks
You'll want to select a public event from the list below, set the callback URL for the webhook and lastly name the webhook.
```javascript
var events = ['user_added'];
var callback_url = 'https://YOUR_SITE/API/WEBHOOK_ENDPOINT';
var name = 'user-added-demo';
webhooks.createWebhooks(events, callback_url, name);
```
*Response:*
```json
{"webhook":{
    "id":"WH_#####-#####",
    "name":"user-added",
    "account_sid":"AC######",
    "service_id":"###",
    "url":"https://YOUR_SITE/API/WEBHOOK_ENDPOINT",
    "signing_key":"SIGNING_KEY",
    "events":["user_added"]
},
"message":"Webhook created",
"success":true
}
```
### Deleting a Webhook
You'll need the unique identifier for your webhook to initate a delete.
```javascript
var webhook_id = "WH_#####-####";
webhooks.deleteWebhook(webhook_id);
```
*Response:*
```
{"message":"Webhook deleted","success":true}
```
### Verify a Webhook
```javascript
var webhook_signing_key = ''; // unique key associated with a specific webhook
var encoded_message = '';     // this is the message passed from the callback
var decoded = webhooks.verifyJWTResponse(encoded_message, webhook_signing_key);
console.log(util.inspect(decoded, false, null));
```
