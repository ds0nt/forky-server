
//initialize app
require('./app/app.js');

var plugins = require('./app/plugins');
plugins.load();

plugins.initShare(function(err) {
	console.log('plugin share initialized');
});

require('./app/middleware.js');

require('./app/routes.js');



plugins.initApi(function() {
	console.log('plugin api initialized');
});
