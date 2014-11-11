
var expressSession = require('express-session'),
	sessionStore = new expressSession.MemoryStore(),
	cookieParser = require('cookie-parser')(),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	bcrypt = require('bcrypt'),
	api = require('./api'),
	metaserver = require('./share/live');


/**
 * Get the session ID cookie from request.
 *
 * @return {string}
 * @private
 */
var cookie = require('cookie'),
	signature = require('cookie-signature');

function getcookie(req, name, secret) {
  var header = req.headers.cookie;
  var raw;
  var val;

  // read from cookie header
  if (header) {
    var cookies = cookie.parse(header);

    raw = cookies[name];

    if (raw) {
      if (raw.substr(0, 2) === 's:') {
        val = signature.unsign(raw.slice(2), secret);

        if (val === false) {
          debug('cookie signature invalid');
          val = undefined;
        }
      } else {
        debug('cookie unsigned')
      }
    }
  }

  // back-compat read from cookieParser() signedCookies data
  if (!val && req.signedCookies) {
    val = req.signedCookies[name];

    if (val) {
      deprecate('cookie should be available in req.headers.cookie');
    }
  }

  // back-compat read from cookieParser() cookies data
  if (!val && req.cookies) {
    raw = req.cookies[name];

    if (raw) {
      if (raw.substr(0, 2) === 's:') {
        val = signature.unsign(raw.slice(2), secret);

        if (val) {
          deprecate('cookie should be available in req.headers.cookie');
        }

        if (val === false) {
          debug('cookie signature invalid');
          val = undefined;
        }
      } else {
        debug('cookie unsigned')
      }
    }
  }

  return val;
}

module.exports = function(app, server) {
	var cookieSecret = 'SECRETZZZ';
	var cookieName = 'connect.sid';
	app.use(cookieParser);
	var session = expressSession({store: sessionStore, name: cookieName, secret: cookieSecret});
	app.use(session);

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

	metaserver(server, function(req, fn) {
		var opts = {store: sessionStore, name: cookieName, secret: cookieSecret};
		var sid = getcookie(req, opts.name, opts.secret);
		opts.store.load(sid, fn);
	});
};