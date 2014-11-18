var WebSocketServer = require('ws').Server;
var Duplex = require('stream').Duplex;
var _ = require('underscore');
var api = require('../api.js');


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
		server: null
	};

	_.extend(this.options, options);
	this.options = _.extend(options, this.options);
	this.wss = new WebSocketServer({
	  server: options.server
	});

	this.wss.on('connection', function(ws) {

		//parse token from url
		var token = ws.upgradeReq.url.substring(1);

		api.user.getByToken(token, function(err, user) {
			if (err)
				return cb(err, null);

			var stream = wsToStream(ws);
			stream.user = user;

			cb(null, stream);
		});
	});
}