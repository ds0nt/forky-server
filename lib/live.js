var Duplex = require('stream').Duplex;

// var socketIO = require('socket.io')
// var cookieParser = require('cookie-parser')()
// var SessionSockets = require('express-session.io');

var gravatar = require('nodejs-gravatar');

// var livedbMongo = require('livedb-mongo');
// var db = livedbMongo('mongodb://localhost:27017/test?auto_reconnect', {safe:true});
// backend = livedb.client(db);

var livedb = require('livedb');
var sharejs = require('share');

var live = {
	init: function(server) {
		this.backend = livedb.client(livedb.memory());
		this.share = sharejs.server.createClient({backend: this.backend});
		// this.sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

		var WebSocketServer, wss;

		WebSocketServer = require('ws').Server;

		wss = new WebSocketServer({
		  server: server
		});

		wss.on('connection', function(client) {
		  console.log('Connection');
		  var stream;
		  stream = new Duplex({
		    objectMode: true
		  });

		  stream._write = function(chunk, encoding, callback) {
		    console.log('s->c ', chunk);
		    client.send(JSON.stringify(chunk));
		    return callback();
		  };

		  stream._read = function() {};

		  stream.headers = client.upgradeReq.headers;
		  stream.remoteAddress = client.upgradeReq.connection.remoteAddress;

		  client.on('message', function(data) {
		    console.log('c->s ', data);
		    return stream.push(JSON.parse(data));
		  });

		  stream.on('error', function(msg) {
		    return client.close(msg);
		  });

		  client.on('close', function(reason) {
		    stream.push(null);
		    stream.emit('close');
		    console.log('client went away');
		    return client.close(reason);
		  });

		  stream.on('end', function() {
		    return client.close();
		  });

		  return live.share.listen(stream);
		});

	}
};

module.exports = live;



// var io = socketIO(server);

// var chatcounter = 0;

// var sockets = {};
// var boards = {};



// var Board = {
// 	create: function(board) {
// 		console.log('Creating Board: ' + board);

// 		boards[board] = {
// 			id: board,
// 			conns: {},
// 			v: 0,
// 		};

// 		backend.submit('map', board, {v:0, create:{type:'json0', data:{}}}, function(err) {
// 			if (err) {
// 			  	console.log(err);
// 			}
// 			console.log('Create Map ' + board);

// 			backend.fetchAndSubscribe('map', board, function(err, data, stream) {
// 			  if (err) {
// 			  	console.log(err);
// 			  }
// 			  console.log('Subscribing');
// 			  stream.on('data', function(op) {
// 			  	console.log('==onData==');
// 			  	console.log('op: ' + op);
// 			  	boards[board].v = op.v;
// 				sessionSockets.io.to('board-' + boards[board].id).emit('op', op);
// 			  });
// 			});
// 		});

// 	},

// 	addSocketToBoard: function(board, socket) {
// 		boards[board].conns[socket.id] = socket;
// 		socket.user.board = board;

// 		//Join Channel
// 		socket.join('board-' + boards[board].id);
// 	},

// 	message: function(board, msg) {
// 		sessionSockets.io.to('board-' + boards[board].id).emit('board message', msg);
// 	}
// };

// sessionSockets.on('connection', function(err, socket, session) {
// 	sockets.id = socket;

// 	if (typeof session === 'undefined') {
// 		console.log('Dropping Sessionless Connection');
// 		socket.disconnect();
// 		return;
// 	}

// 	socket.user = {
// 		username: session.passport.user.mail,
// 		board: null
// 	};


// 	socket.on('op', function(op) {
// 		console.log(op);
// 		backend.submit('map', socket.user.board, op, function(err) {
// 			console.log(err);
// 		});
// 	});

// 	socket.on('open', function(board) {
// 		if (!boards[board]) {
// 			Board.create(board);
// 		}
// 		Board.addSocketToBoard(board, socket);

// 		console.log("Client " + socket.id + " Connected");

// 		var data = {
// 			id: chatcounter++,
// 			title: socket.user.username + ' has joined',
// 			board: socket.user.board,
// 			typeid: 2,
// 			picsrc: gravatar.imageUrl(socket.user.username),
// 			timestamp: Date.now(),
// 			from: "web"
// 		};

// 		Board.message(socket.user.board, data);

// 	});

// 	socket.on('board message', function(msg) {
// 		console.log("messaged recived: " + msg);
// 		var data = {
// 			id: chatcounter++,
// 			title: socket.user.username,
// 			board: socket.user.board,
// 			msg: msg,
// 			typeid: 1,
// 			picsrc: gravatar.imageUrl(socket.user.username),
// 			timestamp: Date.now(),
// 			from: "web"
// 		};

// 		Board.message(socket.user.board, data);
// 	});


// 	socket.on('disconnect', function () {
// 		console.log("Client " + socket.id + " Disconnected");

// 		if (socket.user.board) {
// 			delete boards[socket.user.board].conns[socket.id];
// 			var data = {
// 				id: chatcounter++,
// 				title: socket.user.username + ' has left',
// 				board: socket.user.board,
// 				typeid: 2,
// 				picsrc: gravatar.imageUrl(socket.user.username),
// 				timestamp: Date.now(),
// 				from: "web"
// 			};

// 			Board.message(socket.user.board, data);
// 		}

// 		delete sockets[socket.id];


// 	});

// });