var gravatar = require('nodejs-gravatar');

module.exports = function(shareApi) {

	// Per Socket Connection
	// useful for authentication
	shareApi.connect(function(req, callback) {
		var httpSession = req.stream.sess;
		if (typeof httpSession ==='undefined' || typeof httpSession.passport.user === 'undefined') {
			req.agent.auth = false;
		} else {
			req.agent.auth = true;
			req.agent.user = req.stream.sess.passport.user;
			req.agent.user.picsrc = gravatar.imageUrl(req.agent.user.email);
			delete req.agent.user.password;
		}
		if (req.stream.headers.metatoken == 'jsgraph')
			req.agent.auth = true;

		delete req.stream.sess;

		if (req.agent.auth) {
			console.log('Connection Approved');
			callback();
		} else {
			console.log('Connection Denied');
		}
	});
    console.log('plugins.front share initialized');
};