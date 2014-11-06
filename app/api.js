var config = require('config'),
	thinky = require('thinky')(config.rethinkdb),
	r = thinky.r,
	Query = thinky.Query,
	bcrypt = require('bcrypt'),
	validator = require('validator');


var User = thinky.createModel('User', {
    id: String,
    email: {_type: String, validator: validator.isEmail, enforce_missing: true},
    password: {_type: String, enforce_missing: true},
    date: {_type: Date, default: r.now()}
});

var Graph = thinky.createModel('Graph', {
    id: String,
    userId: String,
    title: {
    	_type: String,
		enforce_missing: true
	},
    date: {_type: Date, default: r.now()}
});

// A Graph has one User that we will keep in the field `user`.
Graph.belongsTo(User, 'user', 'userId', 'id');
User.hasMany(Graph, 'graph', 'id', 'userId');

// Make sure that an index on date is available

Graph.ensureIndex('date');
Graph.ensureIndex('userId');
User.ensureIndex('email');

var handleDbError = function(err) {
	console.log(err);
};


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
    	User.filter({'email': req.email}).run().then(function(user) {
	        res.json({
	            posts: posts
	        });
	    }).error(handleDbError);
	},

	authenticate: function(email, password, done) {

		return User.filter({email: email}).run().then(function(user) {
			console.log('user', user);
			console.log('email', email);
			console.log('password', password);
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

exports.graph = {
	get: function (req, res) {
    	Graph.orderBy({index: r.desc('date')}).filter({userId: req.user.id}).getJoin({user: true}).run().then(function(graphs) {
	        res.json({
	            graphs: graphs
	        });
	    }).error(handleDbError);
	},

	create: function(req, res) {
	    var graph = new Graph(req.body);
	    graph.userId = req.user.id;
	    graph.save().then(function(result) {
	        res.json({
	            graph: result
	        });
	    }).error(function(error) {
	    	console.log('Graph Create error');
	    	console.log(error);
	    	res.json({
	    		error: error
	    	});
	    });
	},

	delete: function(res, req) {
	    var id = req.params.id;

	    // We can directly delete the Graph since there is no foreign key to clean
	    Graph.get(id).delete().run().then(function(result) {
	        res.json({
	            result: result
	        });
	    }).error(function(error) {
	    	console.log('Graph Delete error');
	    	console.log(error);
	    	res.json({
	    		error: error
	    	});
	    });
	}
};