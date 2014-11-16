var config = require('config'),
	thinky = require('thinky')(config.rethinkdb),
	r = thinky.r,
	validator = require('validator'),
	gravatar = require('nodejs-gravatar'),
    User = require('../../api.js').User,
    ms = require('../../meta-server.js'),
    app = require('../../app.js');

var auth = function(req, res, next){
	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};

var handleDbError = function(err) {
    console.log(err);
};

app.instance.get('/graphs', auth, _get);
app.instance.get('/graphs/:id', auth, _get);
app.instance.post('/graphs', auth, _create);
app.instance.delete('/graphs/:id', auth, _delete);
app.instance.get('/graphs/join/:id', auth, _join);

console.log('plugins.graph api initialized');




var Graph = thinky.createModel('Graph', {
    id: String,
    creator: String,
    shared: String,
    collaborators: [String],
    title: {
    	_type: String,
		enforce_missing: true
	},
    date: {_type: Date, default: r.now()},
    shareURL: {
        _type: "virtual",
        default: function() {
            return "/graphs/join/"+this.id;
        }
   }
});


// A Graph has one User that we will keep in the field `user`.
Graph.belongsTo(User, 'user', 'creator', 'id');
User.hasMany(Graph, 'graph', 'id', 'creator');

// Make sure that an index on date is available

Graph.ensureIndex('date');
Graph.ensureIndex('creator');
Graph.ensureIndex('collaborators', function(doc) { return doc("collaborators") }, {multi: true});

function _get(req, res) {
	Graph.getAll(req.user.id, {index: 'collaborators'}).run().then(function(graphs) {
        res.json({
            graphs: graphs
        });
    }).error(handleDbError);
};

function _create(req, res) {
    var graph = new Graph(req.body);
    graph.creator = req.user.id;
    graph.collaborators = [req.user.id];
    graph.shared = 'public';
    graph.save().then(function(result) {

        ms.agent.submit('graph', result.id, {create: {
            type: 'json0',
            data: {
                nodes: {
                    root: {text: 'Mind Map'}
                },
                edges: []
            }
        }}, function (err, shareresult) {
            if (err) {
                console.log(err);
                return null;
            }
            ms.agent.submit('chat', result.id, {create: {
                type: 'json0',
                data: {
                    chats:[],
                    users:{}
                }
            }}, function (err, shareresult) {
                res.json({
                    graph: graph
                });
            });
        });

    }).error(function(error) {
    	console.log('Graph Create error');
    	console.log(error);
    	res.json({
    		error: error
    	});
    });
};

function _join(req, res) {
	console.log('req', req.params);
	Graph.get(req.params.id).run().then(function(graph) {
		console.log('graph', graph);
		var data = {
			collaborators: graph.collaborators
		};
		data.collaborators.push(req.user.id);
		graph.merge(data).save().then(function(err, result) {
			res(result);
		})
	});
};

function _delete(res, req) {
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
};