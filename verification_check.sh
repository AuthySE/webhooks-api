clear
echo Sending Phone Verification Request
echo
echo Request
echo curl "https://api.authy.com/protected/$AUTHY_API_FORMAT/phones/verification/check?phone_number=\$WEBHOOKS_PHONE&country_code=\$WEBHOOKS_COUNTRY&verification_code=\$1" \
echo -H "X-Authy-API-Key: \$WEBHOOKS_AUTHY_API_KEY"
echo
echo Response
curl "https://api.authy.com/protected/$AUTHY_API_FORMAT/phones/verification/check?phone_number=$WEBHOOKS_PHONE&country_code=$WEBHOOKS_COUNTRY&verification_code=$1" \
-H "X-Authy-API-Key: $WEBHOOKS_AUTHY_API_KEY"
echo