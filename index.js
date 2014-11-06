var express = require('express')
	, util = require('util')
	, config = require('config');



var app = express();

var server = app.listen(config.get('server.port'), function(){
	console.log('listening on *:' + config.get('server.port'));
});

require('./app/middleware')(app);

var live = require('./app/share/live');
live.init(server);

var routes = require('./app/routes')(app);

