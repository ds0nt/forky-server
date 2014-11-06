var r = require('rethinkdb'),
    connection;



var myArgs = require('optimist').argv;
var cmds = {};



cmds.help = function() {
   console.log("MetaMap Server Useful Commands");
}

cmds.clearMaps = function() {

	r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
		if (err) throw err;
		connection = conn;
		r.db('test').table('maps').delete().run(conn, function(err, res) {
		  if(err && err.name === "RqlRuntimeError") {
		  	console.log("Table already exist. Skipping creation.");
		  } else {
		    console.log(res);
		    throw err;
		  }
		});
	});
}


for (var i = 0; i < myArgs.length; i++) {
	cmds[myArgs[i]]();
};
