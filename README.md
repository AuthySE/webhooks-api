# Authy Webhook API Examples
This repo demonstrates how to Create, List, Delete Authy webhooks.  You can set a webhook to be called after a publically visible event (listed below). Webhooks use a `POST` when responding.  This code also demonstrates how to sign a request and verify the signature in a response.

Official documentation may be found here:
[https://www.twilio.com/docs/api/authy/authy-webhooks-api](https://www.twilio.com/docs/api/authy/authy-webhooks-api)

### Setup
1. Clone this repo
2. `npm install`
3. Browse to the application you want to use in the twilio.com/console where (once enabled) you should now see:
    * App API Key
    * Your Access Key
    * API Signing Key
5. Add the above keys to `demo.env`
6. `source demo.env`
7. Uncomment functionality you want to use in `test-webhooks.js`
8. `node test-webhooks.js` to test

### Public Events to Trigger Webhooks
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

**Listing Webhooks:**
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

**Create Webhooks:**
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
**Deleting a Webhook**
You'll need the unique identifier for your webhook to initate a delete.
```javascript
var webhook_id = "WH_#####-####";
webhooks.deleteWebhook(webhook_id);
```
*Response:*
```
{"message":"Webhook deleted","success":true}
```
**Verify a Webhook**
```javascript
var webhook_signing_key = ''; // unique key associated with a specific webhook
var encoded_message = '';     // this is the message passed from the callback
var decoded = webhooks.verifyJWTResponse(encoded_message, webhook_signing_key);
console.log(util.inspect(decoded, false, null));
```
