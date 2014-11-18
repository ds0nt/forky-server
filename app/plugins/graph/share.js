
chatSubscribe = function(req) {
	//Add Participant
	req.agent.submit(req.collection, req.docName, {op: [{p:['users', req.agent.user.id], oi:{status: 'online', user: req.agent.user}}]}, {}, function(err, v, ops) {
		console.log(err, v, ops);
	});

	//Remove on Stream End
	req.agent.stream.on('end', function() {
		req.agent.submit(req.collection, req.docName, {op: [{p:['users', req.agent.user.id], od:{}}]}, {}, function(err, v, ops) {
			console.log(err, v, ops);
		});
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
					console.log('col, doc', col, doc);
					chatSubscribe(req);
				}
			}
		}
		callback();
	})

	// Add User into Chat Participants
	shareApi.subscribe('chat', function(req, callback) {
		console.log('==== SUBSCRIBE CHAT ===');

		chatSubscribe(req);

		callback();
	});

	shareApi.submit('graph', function(req, callback) {
		console.log(req.opData);

		callback();
	});
};