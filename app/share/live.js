var Duplex = require('stream').Duplex;

var gravatar = require('nodejs-gravatar');
// var livedbMongo = require('livedb-mongo');
// var db = livedbMongo('mongodb://localhost:27017/test?auto_reconnect', {safe:true});
// backend = livedb.client(db);

var livedb = require('livedb');
var sharejs = require('share');
var WebSocketServer = require('ws').Server;

function wsToStream(ws) {
  var stream;
  stream = new Duplex({
    objectMode: true
  });

  stream._write = function(chunk, encoding, callback) {
    ws.send(JSON.stringify(chunk));
    return callback();
  };

  stream._read = function() {};

  stream.headers = ws.upgradeReq.headers;
  stream.remoteAddress = ws.upgradeReq.connection.remoteAddress;

  ws.on('message', function(data) {
    return stream.push(JSON.parse(data));
  });

  stream.on('error', function(msg) {
    return ws.close(msg);
  });

  ws.on('close', function(reason) {
    stream.push(null);
    stream.emit('close');
    return ws.close(reason);
  });

  stream.on('end', function() {
    return ws.close();
  });

  return stream;
}


function MetaServer(server, getSession) {
	//Create Pipe

	var backend = livedb.client(livedb.memory());

	var share = sharejs.server.createClient({
		backend: backend,

		preValidate: function(opData, action) {
			// console.log('==== PREVALIDATE ===');
		},
		//Per Op Validation
		validate: function(opData, action) {
			// console.log('==== VALIDATE ===');
			// console.log('agent', agent);
			// console.log('action', action);
		},
	});

	var wss = new WebSocketServer({
	  server: server
	});

	wss.on('connection', function(ws) {
		//Get Handshake Request and Extract SessionID
		var req = ws.upgradeReq;
		getSession(req, function(err, sess) {
			if (err)
				return;

			//Link Session to Stream
			var stream = wsToStream(ws);
			stream.sess = sess;
			share.listen(stream);
		});
	});

	//Per Connect Authentication
	share.use('connect', function(req, callback) {
		// console.log('==== CONNECT ===');
		var httpSession = req.stream.sess;

		if (typeof httpSession.passport.user === 'undefined') {
			req.agent.auth = false;
		} else {
			req.agent.auth = true;
			req.agent.user = req.stream.sess.passport.user;
			req.agent.user.picsrc = gravatar.imageUrl(req.agent.user.email);
			delete req.agent.user.password;
		}

		delete req.stream.sess;

		if (req.agent.auth) {
			callback();
		} else {
			console.log('Connection Denied');
			console.log('req.agent.auth', req.agent.auth);
		}
	});

	share.use('subscribe', function(req, callback) {
		// console.log('==== SUBSCRIBE ===');

		if (req.collection == 'mapchat') {
			req.agent.submit(req.collection, req.docName, {op: [{p:['users', req.agent.user.id], oi:{status: 'online', user: req.agent.user}}]}, {}, function(err, v, ops) {
				console.log(err, v, ops);
			});
			req.agent.stream.on('end', function() {
				req.agent.submit(req.collection, req.docName, {op: [{p:['users', req.agent.user.id], od:{}}]}, {}, function(err, v, ops) {
					console.log(err, v, ops);
				});
			});
		}
		// console.log(req);
		if (true)
			callback();
	});

	share.use('unsubscribe', function(req, callback) {
		console.log('==== UNSUBSCRIBE ===');

		if (req.collection == 'mapchat') {

		}
		callback();
	});

	//Per Op Request (can be multiple ops)
	share.use('submit', function(req, callback) {
		// console.log('==== SUBMIT ===');

		// console.log('MiddleWare Submit: req.collection', req);
		callback();
	});
	share.use('after submit', function(req, callback) {
		// console.log('==== AFTER SUBMIT ===');
		callback();
	});

	share.use('query', function(req, callback) {
		// console.log('==== QUERY ===');
		callback();
	});
};

module.exports = MetaServer;