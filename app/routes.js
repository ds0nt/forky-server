var express = require('express'),
	api = require('./api'),
	passport = require('passport'),
	config = require('config'),
	app = require('./app');


var client_dir = config.get('client.appPath');
var landing_dir = config.get('client.landingPath');

app.instance.use('/public', express.static(client_dir));

app.instance.post('/login',
	passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});


app.instance.post('/user', api.user.create);

app.instance.get('/app/*', function(req, res) {
    res.sendFile(client_dir + '/index.html');
});
app.instance.get('/', function(req, res) {
    res.sendFile(client_dir + '/index.html');
});
