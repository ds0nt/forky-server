var config = require('config'),
	thinky = require('thinky')(config.rethinkdb),
    r = thinky.r,
    validator = require('validator'),
    gravatar = require('nodejs-gravatar'),
    tokenAuth = require('../../middleware').tokenAuth,
    User = require('../../api.js').User,
    ms = require('../../meta-server.js'),
    app = require('../../app.js');

var handleDbError = function(err) {
    console.log(err);
};

app.instance.post('/graph', tokenAuth, _create);
app.instance.post('/graphlist', tokenAuth, _get);
app.instance.get('/graph/:id', tokenAuth, _get);
app.instance.get('/graph/join/:id', tokenAuth, _join);

// app.instance.delete('/graph/:id', tokenAuth, _delete);

var Graph = thinky.createModel('Graph', {
    id: String,
    creator: String,
    shared: String,
    collaborators: [String],
    title: {
    	_type: String,
		enforce_missing: true
	},
    // date: {_type: Date, default: r.now()},
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

function createShareGraph(id, cb) {
        ms.agent.submit('graph', id, {
            create: {
                type: 'json0',
                data: {
                    nodes: {
                        root: {text: 'Mind Map'}
                    },
                    edges: []
                }
            }
        }, cb);
    }

function createShareChat(id, cb) {
    ms.agent.submit('chat', id, {
        create: {
            type: 'json0',
            data: {
                chats:[],
                users:{}
            }
        }
    }, cb);
}

function _create(req, res) {
    var graph = new Graph({
        title: req.body.title,
        creator: req.user.id,
        collaborators: [req.user.id],
        shared: 'public',
    });

    var collaborators = {};
    collaborators[graph.creator] = {};

    

    graph.save().then(function(graph) {
        createShareGraph(graph.id, function (err, shareresult) {
            if (err) {
                console.log('create share graph', err);
                return;
            }
            createShareChat(graph.id, function (err, shareresult) {
                if (err) {
                    console.log('create share chat', err);
                    return;
                }
                res.json({
                    graph: graph
                });
            });
        });

    }).error(function(error) {
    	console.log('Graph Create error');
    	console.log(error);

    	res.json({
    		error: 'There was an error creating the graph'
    	});
    });
};

function _join(req, res) {
	Graph.get(req.params.id).run().then(function(graph) {
		var data = {
			collaborators: graph.collaborators
		};
		data.collaborators.push(req.user.id);
		graph.merge(data).save().then(function(err, result) {
			res.json(result);
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

module.exports = function() {
    //Init Logic
}