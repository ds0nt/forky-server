console.log('Loading Default Config');

module.exports = {

	assets: '../client/dist',

	server: {
		port: 8088,
	},

	rethinkdb: {
		host: 'rethink',
		port: 28015,
		db: 'forky',
		authKey: "",
	},

	livedb: {
		backend: 'mongo',
		mongo: 'mongodb://mongo:27017/forky?auto_reconnect',
	},

};
