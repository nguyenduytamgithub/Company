// MODEL (DB)

var db = require('./base.js'),
	basic = require('./basicrose.js').BasicRose,
	dbBasicRose = new basic (db.dbRosePool, db.dbRoseConfig, "rose")

for (key in dbBasicRose) {
	exports[key] = dbBasicRose[key]
}
