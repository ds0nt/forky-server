// Environment Variable Mapping. Overrides any config other than CLI

module.exports = {

  assets: 'FORKY_CLIENT',

  server: {
    port: 'FORKY_PORT',
  },

  rethinkdb: {
    host: 'FORKY_RETHINK_HOST',
    port: 'FORKY_RETHINK_PORT',
    db: 'FORKY_RETHINK_DB',
    authKey: 'FORKY_RETHINK_AUTH_KEY',
  },

  livedb: {
    backend: 'FORKY_LIVEDB_BACKEND',
    mongo: 'FORKY_LIVEDB_MONGO_CONNECTION',
  },

};
