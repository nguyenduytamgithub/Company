// CONTROLLER (ADMIN)

var dbRose = require('../../models/db/rose.js'),
	dbPendRose = require('../../models/db/pendrose.js')

var async = require('async'),
	Worker = require('webworker-threads').Worker

// Danh sách tình trạng các chậu cây hiện tại mà cảm biến đo được
let potsList = {
	'13D04ASW96': {
		'temp': 0,
		'hum': 0,
		'solar': 0,
		'pH': 0,
		'avgHum': 0
	}
}

///////////////////////////////////////////////////////////////////////////////
//--------------------------------GET DATA-----------------------------------//
///////////////////////////////////////////////////////////////////////////////

exports.getRose = function(req, res) {
	dbRose.getRoseInfo(req.params.roseId, function(err, results) {
		if (err) {
			return res.send('error')
		}
		return res.send(results)
	})
}

exports.getRosesList = function(req, res) {
	dbRose.getRosesList(function(err, results) {
		if (err) {
			return res.send('error')
		}
		return res.send(results)
	})
}

exports.getPendRose = function(req, res) {
	dbPendRose.getRoseInfo(req.params.roseId, function(err, results) {
		if (err) {
			return res.send('error')
		}
		return res.send(results)
	})
}

exports.getPendRosesList = function(req, res) {
	dbPendRose.getRosesList(function(err, results) {
		if (err) {
			return res.send('error')
		}
		return res.send(results)
	})
}

exports.getArea = function(req, res) {
	res.send(encodeURI(JSON.stringify(potsList[req.params.areaId])))
}

exports.getGeneralInfo = function(req, res) {
	dbRose.getGeneralInfo(function(err, results) {
		if (err) {
			return res.send('error')
		}
		res.send(results)
	})
}

///////////////////////////////////////////////////////////////////////////////
//------------------------------RECEIVE DATA---------------------------------//
///////////////////////////////////////////////////////////////////////////////

exports.test = function(req, res) {
	async.parallel({
		worker1: function(callback) {
			var worker = new Worker(function(){
				this.onmessage = function(event) {
					for (let i = 0; i < 100; ++i) {
						console.log("Worker 1: " + i)
					}
					postMessage('Hi ' + event.data)
					self.close()
				}
			})
			worker.onmessage = function(event) {
				callback(null, event.data)
			}
			worker.postMessage("DMT")
		},
		worker2: function(callback) {
			var worker2 = new Worker(function(){
				//postMessage("I'm working before postMessage('ali').")
				this.onmessage = function(event) {
					for (let i = 0; i < 100; ++i) {
						console.log("Worker 2: " + i)
					}
					postMessage('Hi ' + event.data)
					self.close()
				}
			})
			worker2.onmessage = function(event) {
				callback(null, event.data)
			}
			worker2.postMessage("TMD")
		}
	}, function(err, result) {
		console.log("Worker 1 said: " + result.worker1)
		console.log("Worker 2 said: " + result.worker2)
		res.send("OK")
	})
}

// Nhận dữ liệu từ các cảm biến
exports.processData = function(req, res) {
	potsList['13D04ASW96'] = req.body
	res.send("OK")
}
