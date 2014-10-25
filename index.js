var debug = require('debug')('http')
	, express = require('express')
	, session = require('express-session')
	, sessionStore = new session.MemoryStore()
	, passport = require('passport')
	, LocalStrategy = require('passport-local').Strategy
	, bcrypt = require('bcrypt')
	, util = require('util')
	, db = require('./lib/db')
	, cookieParser = require('cookie-parser')()
	, maps = require('./lib/maps')
	, bodyParser = require('body-parser');



var sharejs = require('share');

var app = express()
var server = app.listen(3000, function(){
	console.log('listening on *:3000');
});


app.use(cookieParser);
app.use(session({store: sessionStore, secret: 'SECRETZZZ'}));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// set up the RethinkDB database
db.setup();
var fire = require('./lib/live');
fire.init(server);

app.use(express.static(sharejs.scriptsDir));


passport.use(bodyParser.json());
passport.use(new LocalStrategy(
  function(mail, password, done) {
    // asynchronous verification, for effect...
    // process.nextTick(function () {

      db.findUserByEmail(mail, function (err, user) {
        if (err) { return done(err); }

        if (!user) {
        	return done(null, false, {message: 'Unknown user: ' + mail});
        }

        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, {message: 'Invalid email or password'});
      	}

		return done(null, user);
      });    // });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
  // done(null, user.id);
});

passport.deserializeUser(function (user, done) {
  // db.findUserById(id, done);
  done(null, user)
});

/**
 * @todo Use routes. Just too lazy for now.
 */

var client_dir = __dirname + '/../client/build';
var landing_dir = __dirname + '/../landing';

var auth = function(req, res, next){
	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};

app.get('/', function(req, res){
	res.sendFile('index.html', {root: landing_dir});
});

app.get('/app', function(req, res) {
 	if (req.isAuthenticated())
		res.sendfile('index.html', {root: client_dir});
	else
		res.redirect('/');
});


app.get('/maps', maps.findAll);
app.get('/maps/:id', maps.findById);
app.post('/maps', maps.create);
app.delete('/maps/:id', maps.delete);
app.put('/maps/:id', maps.update);



app.use("/client", express.static(client_dir));
app.use("/landing", express.static(landing_dir));


app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});

app.post('/logout', function(req, res) {
  req.logout();
  res.send(200);
});


app.post('/register', function(req, res) {
  if (!validateEmail(req.param('username'))) {
    // Probably not a good email address.
    console.log('bad email: ' + req.param('username'));
    res.json({'error': {'email': "Invalid Email"}});
    return;
  }
  if (req.param('password') !== req.param('password2')) {
    // 2 different passwords!
    console.log('password mismatch');
    res.json({'error': {'password': "Password Mismatch"}});
    return;
  }

  db.findUserByEmail(req.param('username'), function(err, row) {
  	if (!err) {
		res.json({'error': {'email': 'Email Already Registered'}});
		return
  	}
	// Saving the new user to DB
	db.saveUser({
			mail: req.param('username'),
			password: bcrypt.hashSync(req.param('password'), 8)
		},
		function(err, saved) {
		  console.log("[DEBUG][/register][saveUser] %s", saved);
		  if(err) {
		  	console.log(err)
			res.json({'error': {'server': err}});
		    return
		  }
		  if(saved) {
			res.json({'success': true, 'url': '/app'});
		  }
		  else {
			res.json({'error': {'server': 'User Not Saved'}});
		  }
		  return
	});
  });

});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}
