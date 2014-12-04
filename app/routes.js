var express = require('express'),
	api = require('./api'),
	passport = require('passport'),
	config = require('config'),
    tokenAuth = require('./middleware').tokenAuth,
	app = require('./app');


var client_dir = config.get('client.appPath');

app.instance.use('/public', express.static(client_dir));

app.instance.post('/login',
	passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});


app.instance.post('/user', api.user.create);
app.instance.post('/user/setHelpSeen', tokenAuth, api.user.setHelpSeen);

app.instance.get('/app/*', function(req, res) {
    res.sendFile(client_dir + '/index.html');
});
app.instance.get('/', function(req, res) {
    res.sendFile(client_dir + '/index.html');
});
