var gravatar = require('nodejs-gravatar');

module.exports = function(shareApi) {

	// Per Socket Connection
	// useful for authentication
	shareApi.connect(function(req, callback) {

		req.agent.user = req.stream.user;
		delete req.stream.user;

		if (req.agent.user) {
			console.log('Connection Approved');
			callback();
		} else {
			console.log('Connection Denied');
			callback();
		}
	});
};