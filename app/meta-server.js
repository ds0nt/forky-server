var config = require('config');

var livedb = require('livedb');
var sharejs = require('share');

var app = require('./app.js');
var wsStream = require('./util/ws-stream.js');


var db;

if (config.livedb.backend == 'mongo') {

	db = require('livedb-mongo')(config.livedb.mongo, {
		safe: true
	});

} else {
	console.log('WARNING: livedb is saving to memory');

	db = livedb.memory()
}

var sjsOptions = {
	db: db
};

var share = sharejs.server.createClient(sjsOptions);

//create our agent
var agent = share.createAgent();
//godmode
agent.auth = true;

//attach sharejs to websocket stream
new wsStream({
	server: app.server,
}, function onStream(err, stream) {
	if (err) {
		console.log(err);
		return;
	}

	share.listen(stream);
});


module.exports = {
	share: share,
	agent: agent,
};
