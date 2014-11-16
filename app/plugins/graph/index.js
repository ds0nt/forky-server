var api = require('./api.js');
var ms = require('../../meta-server.js');

var plugin = {
	api: api
};

module.exports = function(data, host, options) {

	return plugin;
};
