
var config = require('config'),
  expressSession = require('express-session'),
	sessionStore = new expressSession.MemoryStore(),
	cookieParser = require('cookie-parser')(),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	api = require('./api.js'),
  app = require('./app.js');


app.instance.use(cookieParser);

var session = expressSession({
  store: sessionStore,
  name: config.cookie.name,
  secret: config.cookie.secret
});

app.instance.use(session);

app.instance.use(bodyParser.json());
app.instance.use(passport.initialize());
app.instance.use(passport.session());


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

module.exports = {
  sessionStore: sessionStore
};