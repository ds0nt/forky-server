(function() {
  var r = require('rethinkdb'),
      connection;

  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    r.db('test').tableCreate('maps').run(conn, function(err, res) {
      if(err && err.name === "RqlRuntimeError") console.log("Table already exist. Skipping creation.");
      else {
        console.log(res);
        throw err;
      }
    });
  });

  exports.findAll = function(req, res) {
    r.table('maps').run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            res.send(JSON.stringify(result, null, 2));
        });
    });
  };

  exports.findById = function(req, res) {
    var id = req.params.id;
    r.table('maps').get(id).
      run(connection, function(err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result, null, 2));
      });
  };

  exports.create = function(req, res) {
    var presentation = req.body;
    console.log("maps ", JSON.stringify(req.body));
    if (!presentation.title) {
      presentation.title = "New Mind Map";
    }
    r.table('maps').insert(presentation).
      run(connection, function(err, result) {
        if (err) throw err;
        res.send(JSON.stringify({status: 'ok', location: '/maps/'+result.generated_keys[0], 'id': result.generated_keys[0]}));
      });
  };

  exports.update = function(req, res) {
    var presentation = req.body,
        id = req.params.id;
    r.table('maps').get(id).update(presentation).
      run(connection, function(err, result)
{        if (err) throw err;
        res.send(JSON.stringify({status: 'ok'}));
      });
  };

  exports.delete = function(req, res) {
    var id = req.params.id;
    r.table('maps').get(id).delete().
      run(connection, function(err, result) {
          if (err) throw err;
          res.send(JSON.stringify({status: 'ok'}));
      });
  };
})();