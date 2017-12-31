let async = require('async')
let dbRose = require('./db/rose.js')

function guardNotEmpty(values) {
	for (idx in values) {
		let val = values[idx]
		if (!val.value || val.value.length == 0) {
			return val.key + " không thể bỏ trống"
		}
	}
	return ""
}
exports.guardNotEmpty = guardNotEmpty

function buildDictFromData(name, mainKey, subKey, data) {
	return function(callback) {
		let idx = 0
		mainKey = mainKey + "[?][" + subKey + "]"
		let res = []
		while(true) {
			let val = data[mainKey.replace("?", idx)]
			if (!val) break
			res.push({key: name, value: val})
			++idx
		}
		callback(null, res)
	}
}

function guardNotEmptyData(data) {
	return function(callback) { // check empty
		if (!data) return callback("Server không nhận được bất kỳ dữ liệu nào")
		async.parallel({
			origins: buildDictFromData("Nơi lai tạo/phát hiện", "origins", "name", data),
			techInfo: buildDictFromData("Số ngày tuổi trong thông tin kỹ thuật", "techInfo", "age", data),
			growth: buildDictFromData("Số ngày tuổi trong quá trình sinh trưởng", "growth", "age", data),
			pests: buildDictFromData("Tên sâu bệnh", "pests", "name", data)
		}, function(err, result) {
			if (err) return callback(err)
			let roseName = data.name
			if (!roseName) roseName = ''
			finalResult = [{key: 'Tên giống hoa', value: roseName}]
			finalResult = finalResult.concat(result.origins)
			finalResult = finalResult.concat(result.techInfo)
			finalResult = finalResult.concat(result.growth)
			finalResult = finalResult.concat(result.pests)
			
			let e = guardNotEmpty(finalResult)
			callback(e)
		})
	}
}
function guardNotSameData(name, mainKey, subKey, data) {
	return function(callback) {
		let idx = 0
		mainKey = mainKey + "[?][" + subKey + "]"
		let res = {}
		while(true) {
			let val = data[mainKey.replace("?", idx)]
			if (!val) break
			if (!res[val]) res[val] = 1
			else return callback(name + " trong bảng không thể giống nhau [" + val + "]")
			++idx
		}
		callback(null, res)
	}
}

function checkSameData(data) {
	return function(callback) {
		async.parallel({
			origins: guardNotSameData("Nơi lai tạo/phát hiện", "origins", "name", data),
			techInfo: guardNotSameData("Số ngày tuổi trong thông tin kỹ thuật", "techInfo", "age", data),
			growth: guardNotSameData("Số ngày tuổi trong quá trình sinh trưởng", "growth", "age", data),
			pests: guardNotSameData("Tên sâu bệnh", "pests", "name", data)
		}, function(err, result) {
			callback(err)
		})
	}
}

exports.guardAddValidRose = function(data, callback) {
	async.waterfall([
		guardNotEmptyData(data),
		checkSameData(data),
		function(callback) {
			dbRose.guardNotAddExistName(data.name, function(err) {
				callback(err, "")
			})
		}
	], function(err, status) {
		callback(err)
	})
}

exports.guardUpdateValidRose = function(data, callback) {
	async.waterfall([
		guardNotEmptyData(data),
		checkSameData(data),
		function(callback) { // check the same name of rose
			dbRose.guardNotUpdateExistName(data.roseId, data.name, function(err) {
				callback(err, "")
			})
		}
	], function(err, status) {
		callback(err)
	})
}
