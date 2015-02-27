
//initialize app
require('./app/app.js');

var plugins = require('./app/plugins');
plugins.load();

plugins.initShare(function(err) {
	console.log('plugin share initialized');
});

plugins.initApi(function() {
	console.log('plugin api initialized');
});


// Authentication & Body Parser
require('./app/middleware.js');


var express = require('express');
var api = require('./app/api');
var passport = require('passport');
var config = require('config');
var tokenAuth = require('./app/middleware').tokenAuth;
var app = require('./app/app');

var fs = require('fs');
var path = require('path');


app.instance.post('/api/login',
	passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});

app.instance.post('/api/user', api.user.create);
app.instance.post('/api/user/setHelpSeen', tokenAuth, api.user.setHelpSeen);



function serveClient(dir) {
	console.log('Serving Forky Client: %s', assets);
	if (!dir) {
		return false;
	}

	var index = path.resolve(dir, 'index.html');
	app.instance.use('/', express.static(dir));
	app.instance.get(/^.*/, function(req, res) {
		res.sendFile(index);
	});

	return dir;
}



var assets = path.resolve(config.get('assets'));

if (assets) {

	if (!fs.existsSync(assets)) {
		throw new Error('Bad Asset Path: ' + assets);
	}

	serveClient(assets);

}
