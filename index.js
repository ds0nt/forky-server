
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

app.instance.post('/api/login',
	passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});

app.instance.post('/api/user', api.user.create);
app.instance.post('/api/user/setHelpSeen', tokenAuth, api.user.setHelpSeen);

var fs = require('fs');
var path = require('path');

var assets = path.resolve(config.get('assets'));
var index = path.resolve(assets, 'index.html');

if (fs.existsSync(assets)) {
	console.log('Serving Web Client: ' + assets);
	app.instance.use('/', express.static(assets));
	app.instance.get(/^.*/, function(req, res) {
		res.sendFile(index);
	});
}
