var ms = require('../../meta-server.js');
var _ = require('underscore');
var opify = require('../../util/op-builder.js');


var chattypes = {
	message: 1,
	join: 2,
}

// op that adds participant to a chat
opify.opifier('join chat', function() {
	return {
		//path, object for insert
		p: ['users', this.agent.user.id],
		oi: {
			user: this.agent.user,
			status: 'online'
		}
	};
});

opify.opifier('join chat message', function(user) {
	return {
		p: ['chats',9999 /* , last index ? */],
		li: {
			t: chattypes.join,
			timestamp: new Date(),
			user: user,
		}
	};
});

//todo, make this logic readable

chatSubscribe = function(req) {

	if (!req.agent.user) {
		return;
	}

	//Add Participant
	// req.agent.submit(req.collection, req.docName, opify(req.agent).op('join chat').op('join chat message', req.agent.user.id).opify(), {}, function(err, v, ops) {
	req.agent.submit(req.collection, req.docName, opify(req.agent).op('join chat').opify(), {}, function(err, v, ops) {

		if (err) {
			console.log(err);
			return
		}

		if (!_.isObject(req.agent.chats)) {
			req.agent.chats = {};
		}

		req.agent.chats[req.docName] = '';
	});

	// Destruction Event - Chat Disconnect
	req.agent.stream.on('end', function() {

		for (var chat in req.agent.chats) {
			req.agent.submit('chat', chat, {op: [{p:['users', req.agent.user.id], od:{}}]}, {}, function(err, v, ops) {
				console.log(err, v, ops);
			});
		}
	});
}

module.exports = function(shareApi) {

	shareApi.bulksubscribe(function(req, callback) {
		console.log('=== bulk subscribe ===');

		for (var col in req.requests) {
			req.collection = col;
			if (col == 'chat') {
				for (var doc in req.requests[col]) {
					req.docName = doc;
					chatSubscribe(req);
				}
			}
		}
		callback();
	})

	shareApi.submit('graph', function(req, callback) {
		if (!req.agent.auth) {
			console.log('illegal graph edit');
			callback('ERRORNESS');
			return;
		}

		callback();
	});

	shareApi.submit('chat', function(req, callback) {
		if (!req.agent.auth) {
			console.log('illegal chat');
			// callback('ERRORNESS');
			return;
		}

		callback();
	});

	// Add User into Chat Participants
	shareApi.subscribe('chat', function(req, callback) {
		console.log('==== SUBSCRIBE CHAT ===');

		chatSubscribe(req);

		callback();
	});

	shareApi.subscribe('graph', function(req, callback) {
		console.log('=== SUB GRAPH ===');

		callback();
	});

	shareApi.unsubscribe('chat', function(req, callback) {
		console.log('=== UNSUB ===');

		if (req.agent.user) {
			req.agent.submit(req.collection, req.docName, {op: [{p:['users', req.agent.user.id], od:{}}]}, {}, function(err, v, ops) {
				if (err) {
					console.log(err);
					return;
				}

				//Delete Stream End Chat Event Handler
				delete req.agent.chats[req.docName];
			});
		}

		callback();
	});
};