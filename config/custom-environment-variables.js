// Environment Variable Mapping. Overrides any config other than CLI

module.exports = {

  server: {
    port: 'MM_PORT',
  },

  rethinkdb: {
    host: 'MM_RETHINK_HOST',
    port: 'MM_RETHINK_PORT',
    db: 'MM_RETHINK_DB',
    authKey: 'MM_RETHINK_AUTH_KEY',
  },

  livedb: {
    backend: 'MM_LIVEDB_BACKEND',
    mongo: 'MM_LIVEDB_MONGO_CONNECTION',
  },

};