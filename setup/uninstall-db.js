var mysql = require("mysql");

var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "test"
});

connection.connect();

connection.query("DROP DATABASE IF EXISTS `node_binddb`", function (err) {
	if (err) {
		throw err;
	} else {
		connection.query("DROP USER 'node_binddb'", function (err) {
			if (err && err.code !== "ER_CANNOT_USER") {
				throw err;
			} else {
				connection.end();
			}
		});
	}
});
