console.log('Loading Default Config');

module.exports = {

  server: {
    port: 3000,
  },

  client: {
    appPath: '/path/to/metamind/build',
  },

  rethinkdb: {
    host: 'localhost',
    port: 28015,
    db: 'MetaMind',
    authKey: "",
  },

  livedb: {
    backend: 'mongo',
    mongo: 'mongodb://localhost/livedb-test?auto_reconnect',
  },

};