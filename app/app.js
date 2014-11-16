
var express = require('express'),
	config = require('config');

var app = express();

var server = app.listen(config.get('server.port'), function(){
	console.log('listening on *:' + config.get('server.port'));
});

module.exports = {
	instance: app,
	server: server,
};