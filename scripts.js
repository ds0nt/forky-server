var r = require('rethinkdb'),
    connection;



var cmds = {};

cmds.help = function() {
   console.log("MetaMap Server Useful Commands");
}

cmds.clearGraphs = function() {
	r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
		if (err) throw err;
		connection = conn;
		r.db('MetaMind').table('Graph').delete().run(conn, function(err, res) {
		  if(err) {
		  	console.log(err);
		  } else {
		    console.log(res);
		  }
		});
	});
}

return cmds[process.argv[2]]();
