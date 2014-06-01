var async = require("async");
var mysql = require("mysql");

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
