var express = require('express'),
	api = require('./api'),
	passport = require('passport'),
	config = require('config');

var client_dir = config.get('client.appPath');
var landing_dir = config.get('client.landingPath');

module.exports = function(app) {

	console.log('landing_dir', landing_dir);

	app.use('/', express.static(landing_dir));
	app.use('/app', express.static(client_dir));

	app.post('/login', passport.authenticate('local'), function(req, res) {
	    res.send(req.user);
	});

	app.post('/logout', function(req, res) {
		if (req.isAuthenticated())
			req.logout();
		res.send(200);
	});

	app.post('/user', api.user.create);

	app.get('/user', auth, api.user.get);

	app.get('/graphs', auth, api.graph.get);
	app.get('/graphs/:id', auth, api.graph.get);
	app.get('/graphs/join/:id', auth, api.graph.join);

	//figuring out map joining mechanizmzzz

	app.post('/graphs', auth, api.graph.create);
	app.delete('/graphs/:id', auth, api.graph.delete);

};

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