var gravatar = require('nodejs-gravatar');

module.exports = function(shareApi) {

	// Per Socket Connection
	// useful for authentication
	shareApi.connect(function(req, callback) {

		req.agent.user = typeof req.stream.user !== 'undefined' ? req.stream.user : false;
		delete req.stream.user;

		console.log(req.agent.user);

		if (req.agent.user) {
			req.agent.auth = true;
			console.log('Connection As ' + req.agent.user.email);
		} else {
			req.agent.auth = false;
			console.log('Connection As Guest');
		}

		callback();
	});
};