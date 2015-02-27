var express = require('express');
var	config = require('config');

var app = express();



var server = app.listen(config.get('server.port'), function(){
	console.log('listening on *:' + config.get('server.port'));
	if (process.send) {
    process.send('online');
	}
});

module.exports = {
	instance: app,
	server: server,
};
