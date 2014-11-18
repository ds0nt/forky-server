var config = require('config'),
	thinky = require('thinky')(config.rethinkdb),
	r = thinky.r,
	Query = thinky.Query,
	bcrypt = require('bcrypt'),
	validator = require('validator'),
	gravatar = require('nodejs-gravatar');


var User = thinky.createModel('User', {
    id: String,
    token: String,
    email: {_type: String, validator: validator.isEmail, enforce_missing: true},
    password: {_type: String, enforce_missing: true},
    picsrc: {_type: String, default: function() {
    	return gravatar.imageUrl(this.email)
	}},
    date: {_type: Date, default: r.now()}
}, {
	enforce_extra: 'remove'
});

var Token = thinky.createModel('Token', {
	id: String,
	date: {_type: Date, default: r.now()},
	powers: {
		_type: Object
	}
});

User.ensureIndex('email');
User.ensureIndex('token');

User.defineStatic("getView", function() {
    return this.without('password');
});

Token.defineStatic("loginToken", function(id, cb) {
	if (id) {
		var token = Token.get(id).run().then(function(token) {
			token.date = r.now();
			token.save().then(cbDbResult(cb)).error(cbDbError(cb));
		});
	} else {
		var token = new Token({
			powers: {
				login: true
			}
		}).save().then(cbDbResult(cb)).error(cbDbError(cb));
	}
});

var handleDbError = function(err) {
	console.log(err);
};

var cbDbResult = function(cb) {
	return function(result) {
		cb(null, result);
	};
};

var cbDbError = function(cb) {
	return function(err) {
		cb(err, null);
	}
}

exports.User = User;
exports.Token = Token;

exports.user = {
	create: function(req, res, done) {
	    var user = new User(req.body);

	    user.password = bcrypt.hashSync(user.password, 8);

	    r.branch(
	    	r.table('User').getAll(user.email, {index: 'email'}).isEmpty(),
	    	r.table('User').insert(user), {}
    	).run().then(function(result) {
	    	if (!result.inserted) {
	    		res.json({
	    			error: 'duplicate email'
	    		});
	    	} else {
	    		res.json(result);
	    	}
       }).error(handleDbError);
	},

	get: function(req, res) {
    	User.get(req.user.id).getView().run().then(function(user) {
	        res.json({
	            user: user
	        });
	    }).error(handleDbError);
	},

	getByToken: function(token, done) {
		return User.filter({token: token}).run().then(function(user) {
			if (user.length === 0) {
				return done('bad token');
			}

			done(null, user[0]);
		}).error(done);
	},

	authenticate: function(email, password, done) {

		return User.filter({email: email}).run().then(function(user) {
			if (user.length === 0) {
				return done('bad email');
			}

			user = user[0];

			if (!bcrypt.compareSync(password, user.password)) {
				return done('bad password');
			}

    		Token.loginToken(user.token, function(err, token) {
    			if (err) {
    				console.log(err);
    				return done('toker error:' + err, null);
    			}
    			user.token = token.id;
    			user.save();

				delete user.password;

				return done(null, {user: user, token: token});
    		});
		}).error(done);
	},
};
