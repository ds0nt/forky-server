
var session = require('express-session'),
	sessionStore = new session.MemoryStore(),
	cookieParser = require('cookie-parser')(),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt'),
	api = require('./api');

module.exports = function(app) {
	app.use(cookieParser);
	app.use(session({store: sessionStore, secret: 'SECRETZZZ'}));

	app.use(bodyParser.json());
	app.use(passport.initialize());
	app.use(passport.session());


	passport.use(bodyParser.json());
	passport.use(new LocalStrategy({
	    	usernameField: 'email',
		},
		function(email, password, done) {

	      api.user.authenticate(email, password, function (err, user) {
	        if (err) {
	        	if (err === "bad password") {
        			return done(null, false);
	        	}
        		return done(err);
	        }

	        if (!user) {
	        	return done(null, false);
	        }

			return done(null, user);
	      });
	  }
	));

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function (user, done) {
	  // db.findUserById(id, done);
	  done(null, user);
	});
};