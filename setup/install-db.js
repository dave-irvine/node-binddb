var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "test"
});

connection.connect();

connection.query("CREATE DATABASE `node_binddb`", function (err) {
	if (err) {
		throw err;
	} else {
		connection.query("CREATE USER 'node_binddb'@'%' IDENTIFIED BY 'test'", function (err) {
			if (err) {
				throw err;
			} else {
				connection.query("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON node_binddb.* TO 'node_binddb'@'%'", function (err) {
					if (err) {
						throw err;
					} else {
						connection.end();
					}
				});
			}
		});
	}
});
