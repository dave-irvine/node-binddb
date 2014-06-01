var async = require("async");
var heredoc = require("heredoc");
var mysql = require("mysql");
var prompt = require("prompt");

console.log("Database installation ready to proceed. This requires access to MySQL instance, or you can run the SQL yourself.\n");

prompt.start();

var remoteSQLProperty = {
	name: 'useremotesql',
	message: 'Do you wish to provide credentials for a MySQL instance?',
	validator: /^[yY][es]*$|^[nN][o]?$/,
	warning: 'Must respond yes or no',
	default: 'no'
};

prompt.get(remoteSQLProperty, function (err, result) {
	var useRemoteSQL = !!(result.useremotesql.toLowerCase()).match(/[yY]/);

	if (useRemoteSQL) {
		var connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "test"
		});

		async.series([
			function (callback) { connection.connect(callback); },
			function (callback) { connection.query("CREATE DATABASE `node_binddb`", callback); },
			function (callback) { connection.query("CREATE USER 'node_binddb'@'%' IDENTIFIED BY 'test'", callback); },
			function (callback) { connection.query("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON node_binddb.* TO 'node_binddb'@'%'", callback); },
			function (callback) { connection.end(callback); }
		], function (err, results) {
			if (err) {
				throw err;
			}
		});
	} else {
		console.log("\nRun the following SQL. Supply a secure password.\n");

		var installSQL = heredoc(function () {/*
CREATE DATABASE `node_binddb`;
CREATE USER 'node_binddb'@'%' IDENTIFIED BY 'password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON node_binddb.* TO 'node_binddb'@'%';
		*/});

		console.log(installSQL);
	}
});
