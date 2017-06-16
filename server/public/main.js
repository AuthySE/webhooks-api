var app = angular.module('authyDemo', []);

app.controller('WebhookController', function ($scope, $http, $interval) {

    $scope.webhook = {
        raw: "",
        unique: 0
    };

    /**
     * Poll against the backend every 5 seconds for 100 times.
     */
    function checkWebhook() {
        $interval(checkData, 5000, 100);
    }

    /**
     * Send the local unique value.  If different on the backend, we'll get the new webhook response
     */
    function checkData() {

        $http.post('/api/webhook', $scope.webhook)
            .success(function (data, status, headers, config) {
                $scope.webhook = data;
                console.log("Webhook success: ", $scope.webhook);
            })
            .error(function (data, status, headers, config) {
                console.log("No new data");
            });
    }

    checkWebhook();
});
