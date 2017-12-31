// MODEL (DB)

var mysql = require('mysql'),
	async = require('async'),
	fileModel = require('../../models/file.js')

var db = require('./base.js'),
	pool = db.dbPendRosePool,
	config = db.dbPendRoseConfig,
	basic = require('./basicrose.js').BasicRose,
	dbBasicRose = new basic (pool, config, "pendrose")

for (key in dbBasicRose) {
	exports[key] = dbBasicRose[key]
}

function insertFlowerImage(connection, roseID, roseInfo) {
	return function(callback) {
		async.waterfall([
			function(callback) {
				let sql = 'SELECT numImgs FROM FlowerImage WHERE flower=?'
				db.dbRosePool.query(sql, roseID, (err, result, fields) => {
					let imageNames = roseInfo.imageNames
					if (result && result.length > 0) {
						let numImgs = result[0].numImgs
						let array = Array.apply(null, {length: numImgs}).map(Number.call, Number)
						let toFolder = "./public/images/temp/"
						let fromFolder = "./public/images/rose/" + roseID + '-'
						async.eachSeries(array,
							function (number, callback) {
								let name = roseID + "-" + number
								if (imageNames && imageNames.indexOf(name) > -1) {
									fileModel.copyFile(fromFolder + number, toFolder + name)
									callback(err, roseID)
								}
								else callback(null, roseID)
							},
							function (err, results) {
								callback(err)
							}
						)
					} else {
						callback(err)
					}
				})
			},
			function(callback) {
				dbBasicRose.insertFlowerImage(connection, roseID, roseInfo)(callback)
			}
		], function(err, results) {
			callback(err, results)
		})
	}
}

exports.updateRoseInfo = function(roseID, roseInfo, callback) {
	let connection = mysql.createConnection(config)
	connection.beginTransaction(function(err) {
		if (err) callback(err, null)
		async.waterfall([
			dbBasicRose.insertFlower(connection, roseInfo),
			function(newRoseID, callback) {
				dbBasicRose.delRoseInfo(roseID, function(err) {
					callback(err, newRoseID)
				})
			},
			function(newRoseID, callback) {
				let sql = 'DELETE FROM FlowerId WHERE flower=?'
				connection.query(sql, newRoseID, (err, rows, fields) => {
					callback(err, newRoseID)
				})
			},
			function(newRoseID, callback) {
				let sql = 'UPDATE Flower SET id=? WHERE id=?'
				connection.query(sql, [roseID, newRoseID], (err, rows, fields) => {
					callback(err)
				})
			},
			function(callback) {
				let sql = 'INSERT INTO FlowerId (flower, definedId) VALUES(?, ?)'
				connection.query(sql, [roseID, roseInfo.definedId], (err, rows, fields) => {
					callback(err)
				})
			},
			function(callback) {
				async.parallel([
					dbBasicRose.insertFlowerOrigin(connection, roseID, roseInfo),
					dbBasicRose.insertFlowerColor(connection, roseID, roseInfo),
					dbBasicRose.insertFlowerTechInfo(connection, roseID, roseInfo),
					dbBasicRose.insertFlowerPests(connection, roseID, roseInfo),
					insertFlowerImage(connection, roseID, roseInfo),
					dbBasicRose.insertFlowerGrowth(connection, roseID, roseInfo)
				], function(err, results) {
					callback(err, roseID)
				})
			}
		], function(err, results) {
			if (err) {
				return connection.rollback(function() {
					callback(err, results)
				})
			}
			connection.commit(function(err) {
				if (err) { 
					return connection.rollback(function() {
						callback(err, results)
					})
				}
				callback(err, results)
			})
		})
	})
}

exports.accept = function(roseID, callback) {
	async.waterfall([
		function(callback) {
			let sql = 'SELECT numImgs FROM FlowerImage WHERE flower=?'
			pool.query(sql, roseID, (err, rows, fields) => {
				if (!rows || rows.length == 0) return callback(err, 0)
				let numImgs = rows[0].numImgs
				let array = Array.apply(null, {length: numImgs}).map(Number.call, Number)
				let toFolder = "./public/images/rose/" + roseID + '-'
				let fromFolder = "./public/images/pendrose/" + roseID + '-'
				async.eachSeries(array,
					function (number, callback) {
						fileModel.rename(fromFolder + number, toFolder + number, function(err) {
							callback(err, numImgs)
						})
					},
					function (err, results) {
						callback(err, numImgs)
					}
				)
			})
		},
		function(newNumImg, callback) {
			let sql = 'SELECT numImgs FROM CMRose.FlowerImage WHERE flower=?'
			pool.query(sql, roseID, (err, rows, fields) => {
				if (!rows || rows.length == 0) return callback(err)
				let numImgs = rows[0].numImgs
				if (newNumImg >= numImgs) return callback(err)
				
				let path = "./public/images/rose/" + roseID + '-'
				let array = Array.apply(null, {length: numImgs - newNumImg}).map(Number.call, Number)
				async.eachSeries(array,
					function (number, callback) {
						let val = number + newNumImg
						fileModel.remove(path + val, function(err) {
							callback(err, roseID)
						})
					},
					function (err, results) {
						callback(err)
					}
				)
			})
		},
		function(callback) {
			let sql = 'CALL AcceptFlower(?)'
			pool.query(sql, roseID, (err, rows, fields) => {
				callback(err)
			})
		}
	], function(err, results) {
		callback(err)
	})
}

exports.reject = function(roseID, callback) {
	dbBasicRose.delRoseInfo(roseID, callback)
}
