var express = require('express'),
	api = require('./api'),
	passport = require('passport'),
	config = require('config'),
    tokenAuth = require('./middleware').tokenAuth,
	app = require('./app');

app.instance.post('/api/login',
	passport.authenticate('local', { session: false }), function(req, res) {
    res.json(req.user);
});


app.instance.post('/api/user', api.user.create);
app.instance.post('/api/user/setHelpSeen', tokenAuth, api.user.setHelpSeen);