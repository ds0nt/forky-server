var gravatar = require('nodejs-gravatar');
var share = require('./share.js');

module.exports = function(data, host, options) {
	return {
		name: 'Front',
		share: share
	};
};