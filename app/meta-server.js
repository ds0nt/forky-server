

var livedb = require('livedb');
var sharejs = require('share');

var wsStream = require('./util/ws-stream.js');

var app = require('./app.js');
var util = require('./util.js');

var livedbMongo = require('livedb-mongo');
var db = livedbMongo('mongodb://localhost:27017/test?auto_reconnect', {safe:true});

var sjsOptions = {
	// backend: livedb.client(livedb.memory()),
	backend: livedb.client(db)
};

//reverse wrap

var share = sharejs.server.createClient(sjsOptions);
var agent = share.createAgent();


//attach sharejs to websocket stream
this.wsStream = new wsStream({
	server: app.server,
	session: true,
	getSession: util.getSession,
}, function onStream(stream) {
	share.listen(stream);
});

module.exports = {
	share: share,
	agent: agent,
};