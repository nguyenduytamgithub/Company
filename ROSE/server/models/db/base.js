// MODEL (DB)

let mysql = require('mysql')
let dbRoseConfig = {
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "12345678",
	database: "CMRose",
	debug:  false
}

let dbPendRoseConfig = {
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "12345678",
	database: "CMPendRose",
	debug:  false
}

let dbAccConfig = {
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "12345678",
	database: "CMAcc",
	debug:  false
}

let dbLogConfig = {
	connectionLimit: 100,
	host: "localhost",
	user: "root",
	password: "12345678",
	database: "CMRoseLog",
	debug:  false
}

exports.dbRoseConfig = dbRoseConfig
exports.dbRosePool = mysql.createPool(dbRoseConfig) // connections pool

exports.dbPendRoseConfig = dbPendRoseConfig
exports.dbPendRosePool = mysql.createPool(dbPendRoseConfig) // connections pool

exports.dbAccConfig = dbAccConfig
exports.dbAccPool = mysql.createPool(dbAccConfig) // connections pool

exports.dbLogConfig = dbLogConfig
exports.dbLogPool = mysql.createPool(dbLogConfig) // connections pool
