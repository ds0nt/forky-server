var express = require('express'),
	api = require('./api'),
	passport = require('passport'),
	config = require('config'),
	app = require('./app');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

var auth = function(req, res, next){
	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};

var client_dir = config.get('client.appPath');
var landing_dir = config.get('client.landingPath');

app.instance.use('/', express.static(landing_dir));
app.instance.use('/app', express.static(client_dir));

app.instance.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

app.instance.post('/logout', function(req, res) {
	if (req.isAuthenticated())
		req.logout();
	res.send(200);
});

app.instance.post('/user', api.user.create);

app.instance.get('/user', auth, api.user.get);


