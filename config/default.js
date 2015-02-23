console.log('Loading Default Config');

module.exports = {

  assets: '/var/www',

  server: {
    port: 8080,
  },

  rethinkdb: {
    host: 'localhost',
    port: 28015,
    db: 'forky',
    authKey: "",
  },

  livedb: {
    backend: 'mongo',
    mongo: 'mongodb://localhost:27017/forky?auto_reconnect',
  },

};
