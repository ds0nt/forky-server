var config = require('config'),
	thinky = require('thinky')(config.rethinkdb),
	r = thinky.r,
	Query = thinky.Query,
	bcrypt = require('bcrypt'),
	validator = require('validator'),
	gravatar = require('nodejs-gravatar');


var User = thinky.createModel('User', {
    id: String,
    email: {_type: String, validator: validator.isEmail, enforce_missing: true},
    password: {_type: String, enforce_missing: true},
    date: {_type: Date, default: r.now()}
}, {
	enforce_extra: 'remove'
});

User.ensureIndex('email');

User.defineStatic("getView", function() {
    return this.without('password');
});

var handleDbError = function(err) {
	console.log(err);
};

exports.User = User;

exports.user = {
	create: function(req, res) {
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
    		user.picsrc = gravatar.imageUrl(user.email);
	        res.json({
	            user: user
	        });
	    }).error(handleDbError);
	},

	authenticate: function(email, password, done) {

		return User.filter({email: email}).run().then(function(user) {
			if (user.length === 0) {
				return done('bad email');
			}
			if (!bcrypt.compareSync(password, user[0].password)) {
				return done('bad password');
			}

			return done(null, user[0]);
		}).error(done);
	}
};
