var JSPlugins = require('js-plugins');
var emitter = require('events').EventEmitter;

var ready = false;
var pluginManager = new JSPlugins();
var plugins = pluginManager.scanSubdirs(__dirname);
var share = require('../meta-server.js').share;

var options = {
	multi: true,
	required: false,
};

var extensions = [];

exports.load = function() {
	emitter = new emitter();

	var shared = {
		onApiReady: function(cb) { emitter.on('api ready', cb); },
		onShareReady: function(cb) { emitter.on('share ready', cb); },
	};

	pluginManager.connect(shared, "metamind", options, function(err, loaded) {
		if (err) {
			console.log('connect err', err);
			return;
		}
		extensions = loaded;
		ready = true;
		emitter.emit('ready', err);
	});
};

var _ready = function(cb) {
	if (ready)
		return cb();
	emitter.once('ready', cb);
};

// db initialization + routes
exports.initApi = function (complete) {
	_ready(function() {
		for (var i = 0; i < extensions.length; i++) {
			if (typeof extensions[i].api === 'function') {
				extensions[i].api();
				console.log('Plugin "' + extensions[i].name + '": API Initialized');
			}
		};
		complete(null, null);
		emitter.emit('api ready');
	});
};

exports.initShare = function(complete) {
	_ready(function() {
		var shareFactory = function(action) {
			return function actionUses(collection, middleware) {
				if (typeof collection === 'function') {
					middleware = collection;
					return share.use(action, middleware);
				}
				share.use(action, function(res, cb) {
					if (res.collection == collection) {
						return middleware(res, cb);
					}
					cb();
				});
			}
		};
		var interface = {
			//arguments: req, cb
			connect: shareFactory('connect'),
			subscribe: shareFactory('subscribe'),
			bulksubscribe: shareFactory('bulk subscribe'),
			unsubscribe: shareFactory('unsubscribe'),
			submit: shareFactory('submit'),
			aftersubmit: shareFactory('after submit'),
			query: shareFactory('query'),
		}

		for (var i = 0; i < extensions.length; i++) {
			if (typeof extensions[i].share === 'function')
				extensions[i].share(interface);
				console.log('Plugin "' + extensions[i].name + '": Share Initialized');
		};

		complete(null, null);
		emitter.emit('share ready');
	});
};