var express = require('express')
	, config = require('config')
	, middlewares = require('./app/middleware')



var app = express();


var server = app.listen(config.get('server.port'), function(){
	console.log('listening on *:' + config.get('server.port'));
});

middlewares(app, server);

var routes = require('./app/routes')(app);

