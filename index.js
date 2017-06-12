var express = require('express');
var app = express();
var server = require('http').Server(app);

var router = express.Router();

var port = process.env.WEBHOOKS_PORT || 3000;

var webhookInMemory = {};

router.route('/webhook').post(function(req, res){
    console.log('webhook: ', req);
    res.status(200).send();    
});

router.route('/webhooked').post(function(req,res){
    console.log('webhooked: ', req);
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

