
var config = require('config'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
	BearerStrategy = require('passport-http-bearer').Strategy,
	api = require('./api.js'),
  app = require('./app.js');


app.instance.use(bodyParser.json());
app.instance.use(passport.initialize());
// app.instance.use(passport.session());


passport.use(bodyParser.json());

passport.use(new BearerStrategy(
  function(token, done) {

    api.User.filter({token: token}).run().then(function(user) {
      if (user.length == 1) {
        return done(null, user[0]);
      }
      return done('token not found');
    }).error(function(err) {
      done(err);
    });
  }
));

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

exports.tokenAuth = function(req, res, next) {
  passport.authenticate('bearer', { session: false })(req, res, next);
};