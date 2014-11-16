
module.exports = {

  server: {
    port: 3000
  },

  client: {
    appPath: '/home/dsont-pc/Projects/mind-map/client/build',
    landingPath: '/home/dsont-pc/Projects/mind-map/landing'
  },

  rethinkdb: {
    host: 'localhost',
    port: 28015,
    authKey: "",
    db: 'MetaMind'
  },

  share: {
    // 'validDocs': ['map', 'mapchat']
  },

  cookie: {
    name: 'SECRETZZZ',
    secret: 'connect.sid',
  }
}