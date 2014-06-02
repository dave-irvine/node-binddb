var async = require("async");
var heredoc = require("heredoc");
var mysql = require("mysql");
var prompt = require("prompt");

console.log("Database installation ready to proceed. This requires access to a MySQL instance, or you can run the SQL yourself.\n");

prompt.start();

var remoteSQLProperty = {
	name: "useremotesql",
	message: "Do you wish to provide credentials for a MySQL instance?",
	validator: /^[yY][es]*$|^[nN][o]?$/,
	warning: "Must respond yes or no",
	default: "no"
};

prompt.get(remoteSQLProperty, function (err, result) {
	var useRemoteSQL = !!(result.useremotesql.toLowerCase()).match(/[yY]/);

	if (useRemoteSQL) {
		(function querySQLPropertiesAndConnect() {
			var sqlPromptSchema = {
				properties: {
					host: {
						message: "Host of MySQL instance",
						required: true,
						default: "localhost"
					},
					username: {
						message: "Username for MySQL instance",
						required: true,
						default: "root"
					},
					password: {
						message: "Password for MySQL instance",
						hidden: true
					}
				}
			};

			prompt.get(sqlPromptSchema, function (err, result) {
				var connection = mysql.createConnection({
					host: result.host,
					user: result.username,
					password: result.password,
					connectTimeout: 2000
				});

				async.series([
					function (callback) { connection.connect(callback); },
					function (callback) { connection.query("CREATE DATABASE `node_binddb`", callback); },
					function (callback) { connection.query("CREATE USER 'node_binddb'@'%' IDENTIFIED BY 'test'", callback); },
					function (callback) { connection.query("GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON node_binddb.* TO 'node_binddb'@'%'", callback); },
					function (callback) { connection.end(callback); }
				], function (err, results) {
					var retryDetailsProperty = {
						name: "retrysqldetails",
						message: "Do you wish to try again?",
						validator: /^[yY][es]*$|^[nN][o]?$/,
						warning: "Must respond yes or no",
						default: "no"
					};

					if (err) {
						if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
							console.log("\nCould not connect to MySQL instance. Is the service running on " + result.host + "?\n");
						} else if (err.code === "ER_ACCESS_DENIED_ERROR") {
							console.log("\nThe credentials you supplied were not accepted by the MySQL instance. Please check and try again.\n");
						} else {
							throw err;
						}

						prompt.get(retryDetailsProperty, function (err, result) {
							var retryDetails = !!(result.retrysqldetails.toLowerCase()).match(/[yY]/);

							if (retryDetails) {
								querySQLPropertiesAndConnect();
							}
						});
					}
				});
			});
		})();
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
