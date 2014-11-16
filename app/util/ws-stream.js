var WebSocketServer = require('ws').Server;
var Duplex = require('stream').Duplex;
var _ = require('underscore');

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




module.exports = function(options, cb) {
	this.options = {
		server: null,
		session: false,
		getSession: function() {
			console.log('Warning: getSession(req, cb) is not defined')
		},
	};

	_.extend(this.options, options);
	this.options = _.extend(options, this.options);
	console.log('ws options', this.options);
	this.wss = new WebSocketServer({
	  server: options.server
	});


	if (options.session) {
		this.wss.on('connection', function(ws) {
			//Get WebSocket Handshake Request and Extract SessionID
			options.getSession(ws.upgradeReq, function(err, sess) {
				if (err) {
					console.log('ws-stream getSession error: ', err);
					return;
				}

				//Link Session to Stream
				var stream = wsToStream(ws);
				stream.sess = sess;
				cb(stream);

			});
		});
	} else {
		this.wss.on('connection', function(ws) {
			var stream = wsToStream(ws);
			cb(stream);
		});
	}
}