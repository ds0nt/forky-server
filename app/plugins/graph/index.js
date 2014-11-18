var api = require('./api.js');
var share = require('./share.js');

module.exports = function(data, host, options) {
	return {
		name: 'Graph',
		api: api,
		share: share
	};
};
