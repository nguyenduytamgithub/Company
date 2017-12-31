// MODEL (DB)

var mysql = require('mysql'),
	async = require('async'),
	fileModel = require('../../models/file.js')


let definedNumPetalType = {
	type: {
		'khoảng': '~',
		'nhiều hơn': '>',
		'ít hơn': '<'
	},
	symbol: {
		'~': 'Khoảng',
		'>': 'Nhiều hơn',
		'<': 'Ít hơn'
	}
}

function parseNumPetalsToStore(numPetalType, numPetals) {
	return definedNumPetalType["type"][numPetalType.toLowerCase()] + numPetals
}

function parseNumPetalsToDisplay(numPetals) {
	return {
		numPetalType: definedNumPetalType['symbol'][finalResult.numPetals[0]],
		numPetals: parseInt(finalResult.numPetals.slice(1))
	}
}

exports.BasicRose = function(dbPool, dbConfig, folderName) {
	var pool = dbPool
	var config = dbConfig
	var storedFolderName = folderName
	
	////////////////////////////////////////////////////////////////////////////////
	//---------------------------Add rose's information---------------------------//
	////////////////////////////////////////////////////////////////////////////////
	function insertFlower(connection, roseInfo) {
		return function(callback) { // add info
			roseInfo.numPetals = parseNumPetalsToStore(roseInfo.numPetalType, roseInfo.numPetals)
			let sql = 'CALL InsertFlower(@id, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
			connection.query(sql,
				[
					roseInfo.definedId, roseInfo.name, roseInfo.sciname, roseInfo.type, roseInfo.heightMin, roseInfo.heightMax, roseInfo.widthMin, roseInfo.widthMax,
					roseInfo.fragrance, roseInfo.petal, roseInfo.numPetals, roseInfo.diameterMin, roseInfo.diameterMax, roseInfo.bloom, roseInfo.tolerance,
					roseInfo.timeMin, roseInfo.timeMax, roseInfo.note
				], (err, results, fields) => {
					callback(err, results[0][0].id)
				}
			)
		}
	}
	this.insertFlower = insertFlower
	
	function insertFlowerOrigin(connection, roseID, roseInfo) {
		return function(callback) {
			let origins = roseInfo.origins
			if (origins) {
				let sql = 'CALL InsertFlowerOrigin(?, ?, ?)'
				async.eachSeries(origins,
					function (origin, callback) {
						connection.query(sql, [roseID, origin.name, origin.year],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					},
					function (err, results) {
						callback(err, roseID)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerOrigin = insertFlowerOrigin

	function insertFlowerColor(connection, roseID, roseInfo) {
		return function(callback) {
			let colors = roseInfo.colors
			if (colors) {
				let sql = 'CALL InsertFlowerColor(?, ?, ?)'
				async.eachSeries(colors,
					function (color, callback) {
						connection.query(sql, [roseID, color.name, color.hex],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					},
					function (err, results) {
						callback(err, roseID)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerColor = insertFlowerColor
	
	function insertFlowerPests(connection, roseID, roseInfo) {
		return function(callback) {
			let pests = roseInfo.pests
			if (pests) {
				let sql = 'CALL InsertFlowerPests(?, ?, ?, ?, ?)'
				async.eachSeries(pests,
					function (pest, callback) {
						connection.query(sql, [roseID, pest.name, pest.agent, pest.sign, pest.solution],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					},
					function (err, results) {
						callback(err, roseID)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerPests = insertFlowerPests
	
	function insertFlowerTechInfo(connection, roseID, roseInfo) {
		return function(callback) {
			let techInfo = roseInfo.techInfo
			if (techInfo) {
				let sql = 'CALL InsertFlowerTechInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
				async.eachSeries(techInfo,
					function (info, callback) {
						connection.query(sql, [roseID, info.age, info.moisMin, info.moisMax, info.tempMin, info.tempMax, info.pHMin, info.pHMax, info.ECMin, info.ECMax, info.solarMin, info.solarMax],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					},
					function (err, results) {
						callback(err, roseID)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerTechInfo = insertFlowerTechInfo
	
	function insertFlowerImage(connection, roseID, roseInfo) {
		return function(callback) {
			let imageNames = roseInfo.imageNames
			if (imageNames) {
				let idx = 0
				let mainIdx = 0
				let fromFolder = "./public/images/temp/"
				let toFolder = "./public/images/" + storedFolderName + "/" + roseID + '-'
				async.eachSeries(imageNames,
					function (imageName, callback) {
						if (imageName == roseInfo.mainImgName) {
							mainIdx = idx
						}
						fileModel.rename(fromFolder + imageName, toFolder + idx, function(err) {
							++idx
							callback(err, roseID)
						})
					},
					function (err, result) {
						let numImgs = imageNames.length
						let sql = 'CALL InsertFlowerImage(?, ?, ?)'
						connection.query(sql, [roseID, numImgs, mainIdx],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerImage = insertFlowerImage
	
	function insertFlowerGrowth(connection, roseID, roseInfo) {
		return function(callback) {
			let growth = roseInfo.growth
			if (growth) {
				let sql = 'CALL InsertFlowerGrowth(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
				async.eachSeries(growth,
					function (info, callback) {
						connection.query(sql, [roseID, info.age, info.tolerance, info.height, info.width, info.budTime, info.numBuds, info.flowerTime, info.numFlowers, info.diameter, info.numPetals, info.fragrance],
							(error, results, fields) => {
								callback(error, roseID)
							}
						)
					},
					function (err, results) {
						callback(err, roseID)
					}
				)
			} else {
				callback(null, roseID)
			}
		}
	}
	this.insertFlowerGrowth = insertFlowerGrowth
	
	this.writeFlowerReview = function(roseID, review) {
		return function(callback) {
			if (review) {
				fileModel.write('./review/' + storedFolderName + '/' + roseID, review, function(err) {
					callback(err, roseID)
				})
			} else {
				delRoseReview(roseID, function(err) {
					callback(err, roseID)
				})
			}
		}
	}

	this.addRoseInfo = function(roseInfo, callback) {
		let connection = mysql.createConnection(config)
		connection.beginTransaction(function(err) {
			if (err) callback(err, null)
			async.waterfall([
				insertFlower(connection, roseInfo),
				function(roseID, callback) {
					async.parallel([
						insertFlowerOrigin(connection, roseID, roseInfo),
						insertFlowerColor(connection, roseID, roseInfo),
						insertFlowerTechInfo(connection, roseID, roseInfo),
						insertFlowerPests(connection, roseID, roseInfo),
						insertFlowerImage(connection, roseID, roseInfo),
						insertFlowerGrowth(connection, roseID, roseInfo)
					], function(err, results) {
						callback(err, roseID)
					})
				}
			], function(err, roseID) {
				if (err) {
					return connection.rollback(function() {
						callback(err, roseID)
					})
				}
				connection.commit(function(err) {
					if (err) { 
						return connection.rollback(function() {
							callback(err, roseID)
						})
					}
					callback(err, roseID)
				})
			})
		})
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//---------------------------Get rose's information---------------------------//
	////////////////////////////////////////////////////////////////////////////////
	this.getRoseImgNames = function(roseID, callback) {
		async.waterfall([
			function(callback) {
				let sql = 'SELECT numImgs FROM FlowerImage WHERE flower=?'
				pool.query(sql, roseID, (err, result, fields) => {
					if (result && result.length > 0) {
						let numImgs = result[0].numImgs // #images of flower
						callback(err, numImgs)
					}
					else callback(err, 0)
				})
			},
			function(numImgs, callback) {
				let imgNames = []
				for (let idx = 0; idx < numImgs; ++idx) {
					imgNames.push(roseID + '-' + idx)
				}
				callback(null, imgNames)
			}
		], function(err, imgNames) {
			callback(err, imgNames)
		})
	}

	this.getRoseReview = function(roseID, callback) {
		readFlowerReview(roseID)(callback)
	}

	this.getRosesList = function(callback) {
		let sql = 'CALL GetFlowersList()'
		pool.query(sql, (err, results, fields) => {
			callback(err, results[0])
		})
	}

	this.getRoseTechInfo = function(roseID, callback) {
		let sql = 'SELECT * FROM FlowerTechInfo WHERE flower=?'
		pool.query(sql, roseID, (err, results, fields) => {
			callback(err, results)
		})
	}

	function queryRoseInfo(roseID, sql) {
		return function(callback) {
			pool.query(sql, roseID, (err, results, fields) => {
				callback(err, results)
			})
		}
	}

	function queryImageNames(roseID) {
		return function(callback) {
			let sql = 'SELECT numImgs, main FROM FlowerImage WHERE flower=?'
			pool.query(sql, roseID, (err, result, fields) => {
				let imgNames = []
				if (result && result.length > 0) {
					let numImgs = result[0].numImgs
					let mainIdx = result[0].main
					let path = '/images/' + storedFolderName + '/'
					for (let iImage = 0; iImage < numImgs; ++iImage) {
						let name = roseID + "-" + iImage
						let fullPath = path + name
						let bound = fileModel.sizeOf('./public' + fullPath)
						imgNames.push({
							name: name,
							width: bound.width,
							height: bound.height,
							size: fileModel.getFileSize('./public' + fullPath),
							path: fullPath,
							isMain: mainIdx == iImage
						})
					}
				}
				callback(err, imgNames)
			})
		}
	}

	function readFlowerReview(roseID) {
		return function(callback) {
			let path = './review/' + storedFolderName + '/' + roseID
			if (fileModel.isExisted(path)) {
				fileModel.read(path, function(err, data) {
					callback(err, data)
				})
			}
			else callback(null, '')
		}
	}

	this.getRoseInfo = function(roseID, callback) {
		async.parallel({
			origins: queryRoseInfo(roseID, 'SELECT o.id, o.name, fo.year FROM FlowerOrigin fo JOIN Origin o ON fo.flower=? AND fo.origin=o.id'),
			colors: queryRoseInfo(roseID, 'SELECT c.id, c.name, c.hex FROM FlowerColor fc JOIN Color c ON fc.flower=? AND fc.color=c.id'),
			pests: queryRoseInfo(roseID, 'SELECT p.id, p.name, p.agent, p.sign, p.solution FROM FlowerPests fp JOIN Pests p ON fp.flower=? AND fp.pests=p.id'),
			techInfo: queryRoseInfo(roseID, 'SELECT age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax FROM FlowerTechInfo WHERE flower=?'),
			growth: queryRoseInfo(roseID, 'SELECT age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance FROM FlowerGrowth WHERE flower=?'),
			imgNames: queryImageNames(roseID),
			definedId: queryRoseInfo(roseID, 'SELECT definedId FROM FlowerId WHERE flower=?'),
			features: queryRoseInfo(roseID, 'SELECT f.id, f.name, f.sciname, t.name as type, f.heightMin, f.heightMax, f.widthMin, f.widthMax, f.fragrance, f.petal, f.numPetals, f.diameterMin, f.diameterMax, f.bloom, f.tolerance, f.timeMin, f.timeMax, f.note FROM Flower f JOIN Type t ON f.id=? AND f.type=t.id')
		}, function (err, results) {
			finalResult = results['features'][0]
			if (finalResult) {
				let res = parseNumPetalsToDisplay(finalResult.numPetals)
				finalResult['numPetalType'] = res.numPetalType
				finalResult.numPetals = res.numPetals
				finalResult['definedId'] = results.definedId[0].definedId
				if (!err) {
					finalResult['origins'] = results.origins
					finalResult['colors'] = results.colors
					finalResult['pests'] = results.pests
					finalResult['techInfo'] = results.techInfo
					finalResult['growth'] = results.growth
					finalResult['imgNames'] = results.imgNames
				}
				return callback(err, finalResult)
			}
			callback(err, {})
		})
	}

	function prepareGeneralData(data) {
		let types = []
		
		if (data.types) {
			data.types.forEach(function(type) {
				types.push(type.name)
			})
		}
		
		let originNames = []
		if (data.originNames) {
			data.originNames.forEach(function(origin) {
				originNames.push(origin.name)
			})
		}
		
		let pestsNames = []
		if (data.pestsNames) {
			data.pestsNames.forEach(function(pests) {
				pestsNames.push(pests.name)
			})
		}
		
		let colors = {}
		if (data.colorNames) {
			data.colorNames.forEach(function(color) {
				colors[color.name] = color.hex
			})
		}
		
		return {
			types: types,
			originNames: originNames,
			pestsNames: pestsNames,
			colorNames: colors
		}
	}

	function queryGeneralInfo(sql) {
		return function(callback) {
			pool.query(sql, (error, rows, fields) => {
				callback(error, rows)
			})
		}
	}

	this.getGeneralInfo = function(callback) {
		async.parallel({
			colorNames: queryGeneralInfo('SELECT name, hex FROM Color'),
			originNames: queryGeneralInfo('SELECT name FROM Origin'),
			pestsNames: queryGeneralInfo('SELECT name FROM Pests'),
			types: queryGeneralInfo('SELECT name FROM Type'),
		}, function (err, results) {
			results = prepareGeneralData(results)
			return callback(err, results)
		})
	}

	this.getDefinedRoseId = function(roseId, callback) {
		let sql = "SELECT definedId FROM FlowerId WHERE flower=?"
		pool.query(sql, roseId, (error, rows, fields) => {
			callback(error, rows[0].definedId)
		})
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//--------------------------Update rose's information-------------------------//
	////////////////////////////////////////////////////////////////////////////////
	function updateFlower(connection, roseID, roseInfo) {
		return function(callback) { // add info
			async.waterfall([
				function(callback) {
					roseInfo.numPetals = parseNumPetalsToStore(roseInfo.numPetalType, roseInfo.numPetals)
					let sql = 'CALL UpdateFlower(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
					connection.query(sql,
						[
							roseID,
							roseInfo.name, roseInfo.sciname, roseInfo.type, roseInfo.heightMin, roseInfo.heightMax, roseInfo.widthMin, roseInfo.widthMax,
							roseInfo.fragrance, roseInfo.petal, roseInfo.numPetals, roseInfo.diameterMin, roseInfo.diameterMax, roseInfo.bloom, roseInfo.tolerance,
							roseInfo.timeMin, roseInfo.timeMax, roseInfo.note
						], (err, results, fields) => {
							callback(err)
						}
					)
				},
				function(callback) {
					let sql = 'UPDATE FlowerId SET definedId=? WHERE flower=?'
					connection.query(sql, [roseInfo.definedId, roseID],
						(err, results, fields) => {
							callback(err)
						}
					)
				}
			], function(err, result) {
				callback(err, roseID)
			})
			
		}
	}

	function deleteAndUpdate(connection, roseID, roseInfo, procedureName, insertFunc) {
		return function(callback) {
			async.waterfall([
				function(callback) {
					let sql = 'CALL ' + procedureName + '(?)'
					connection.query(sql, roseID, (error, results, fields) => {
						callback(error)
					})
				},
				function(callback) {
					insertFunc(connection, roseID, roseInfo)(callback)
				}
			], function(err, results) {
				callback(err, results)
			})
		}
	}

	function updateFlowerOrigin(connection, roseID, roseInfo) {
		return deleteAndUpdate(
			connection,
			roseID,
			roseInfo,
			'DeleteFlowerOrigin',
			insertFlowerOrigin
		)
	}

	function updateFlowerColor(connection, roseID, roseInfo) {
		return deleteAndUpdate(
			connection,
			roseID,
			roseInfo,
			'DeleteFlowerColor',
			insertFlowerColor
		)
	}

	function updateFlowerTechInfo(connection, roseID, roseInfo) {
		return deleteAndUpdate(
			connection,
			roseID,
			roseInfo,
			'DeleteFlowerTechInfo',
			insertFlowerTechInfo
		)
	}

	function updateFlowerPests(connection, roseID, roseInfo) {
		return deleteAndUpdate(
			connection,
			roseID,
			roseInfo,
			'DeleteFlowerPests',
			insertFlowerPests
		)
	}

	function updateFlowerImage(connection, roseID, roseInfo) {
		return function(callback) {
			async.waterfall([
				function(callback) {
					let sql = 'SELECT numImgs FROM FlowerImage WHERE flower=?'
					pool.query(sql, roseID, (err, result, fields) => {
						let imageNames = roseInfo.imageNames
						if (result && result.length > 0) {
							let numImgs = result[0].numImgs
							let array = Array.apply(null, {length: numImgs}).map(Number.call, Number)
							let toFolder = "./public/images/temp/"
							let fromFolder = "./public/images/" + storedFolderName + "/" + roseID + '-'
							async.eachSeries(array,
								function (number, callback) {
									let name = roseID + "-" + number
									if (imageNames && imageNames.indexOf(name) > -1) {
										fileModel.rename(fromFolder + number, toFolder + name, function(err) {
											callback(err, roseID)
										})
									} else {
										fileModel.remove(fromFolder + number, function(err) {
											callback(err, roseID)
										})
									}
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
					let sql = 'CALL DeleteFlowerImage(?)'
					connection.query(sql, roseID, (error, results, fields) => {
						callback(error)
					})
				},
				function(callback) {
					insertFlowerImage(connection, roseID, roseInfo)(callback)
				}
			], function(err, results) {
				callback(err, results)
			})
		}
	}

	function updateFlowerGrowth(connection, roseID, roseInfo) {
		return deleteAndUpdate(
			connection,
			roseID,
			roseInfo,
			'DeleteFlowerGrowth',
			insertFlowerGrowth
		)
	}

	this.updateRoseInfo = function(roseID, roseInfo, callback) {
		let connection = mysql.createConnection(config)
		connection.beginTransaction(function(err) {
			if (err) callback(err, null)
			async.parallel([
				updateFlower(connection, roseID, roseInfo),
				updateFlowerOrigin(connection, roseID, roseInfo),
				updateFlowerColor(connection, roseID, roseInfo),
				updateFlowerTechInfo(connection, roseID, roseInfo),
				updateFlowerPests(connection, roseID, roseInfo),
				updateFlowerImage(connection, roseID, roseInfo),
				updateFlowerGrowth(connection, roseID, roseInfo)
			], function(err, results) {
				if (err) {
					return connection.rollback(function() {
						callback(err, roseID)
					})
				}
				connection.commit(function(err) {
					if (err) { 
						return connection.rollback(function() {
							callback(err, roseID)
						})
					}
					callback(err, roseID)
				})
			})
		})
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//--------------------------Delete rose's information-------------------------//
	////////////////////////////////////////////////////////////////////////////////
	function delRoseReview(roseID, callback) {
		let path = './review/' + storedFolderName + '/' + roseID
		if (fileModel.isExisted(path)) {
			fileModel.remove(path, function(err) {
				callback(err)
			})
		}
		else callback(null)
	}
	
	this.delRoseInfo = function(roseID, callback) {
		async.waterfall([
			function(callback) {
				let sql = 'SELECT numImgs FROM FlowerImage WHERE flower=?'
				pool.query(sql, roseID, (err, result, fields) => {
					if (result && result.length > 0) {
						let array = []
						let numImgs = result[0].numImgs
						for (let idx = 0; idx < numImgs; ++idx) {
							array.push(idx)
						}
						
						let path = "./public/images/" + storedFolderName + "/" + roseID + '-'
						async.eachSeries(array,
							function (number, callback) {
								fileModel.remove(path + number, function(err) {
									callback(err, roseID)
								})
							},
							function (err, results) {
								callback(err)
							}
						)
					}
					else callback(err)
				})
			},
			function(callback) {
				delRoseReview(roseID, callback)
			},
			function(callback) {
				let sql = 'CALL DeleteFlower(?)'
				pool.query(sql, roseID, (err, results, fields) => {
					callback(err)
				})
			}
		], function(err, result) {
			callback(err)
		})
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//---------------------------Guard rose's information-------------------------//
	////////////////////////////////////////////////////////////////////////////////
	this.guardExistsId = function(roseId, callback) {
		let sql = "SELECT COUNT(name) as count FROM Flower WHERE id=?"
		pool.query(sql, [roseId], (err, results, fields) => {
			if (results && results[0]['count'] > 0) {
				callback(null)
			} else {
				callback("Mã giống hoa không tồn tại")
			}
		})
	}

	this.guardNotAddExistName = function(name, callback) {
		let sql = "SELECT COUNT(name) as count FROM Flower WHERE name=?"
		pool.query(sql, [name], (err, results, fields) => {
			if (results && results[0]['count'] > 0) {
				callback("Tên giống hoa đã tồn tại")
			} else {
				callback(null)
			}
		})
	}

	this.guardNotUpdateExistName = function(roseId, name, callback) {
		let sql = "SELECT id FROM Flower WHERE name=?"
		pool.query(sql, [name], (err, results, fields) => {
			if (!results || results.length == 0) return callback(null)
			if (!roseId) return callback("Dữ liệu không hợp lệ")
			if (results[0]['id'] == roseId) callback(null)
			else callback("Tên giống hoa đã tồn tại")
		})
	}
	
	////////////////////////////////////////////////////////////////////////////////
	//--------------------------Prepare rose's information------------------------//
	////////////////////////////////////////////////////////////////////////////////
	function parseDataToArray(key, data, names, tag) {
		let length = names.length
		let arr = []
		if (length > 0) {
			let idx = 0
			while(true) {
				let root = key + '[' + idx + ']'
				let d = data[root + '[' + names[0] + ']']
				if (!d) break
				let name = names[0]
				let info = { name: d }
				for (iName in names) {
					name = names[iName]
					info[name] = data[root  + '['+ name + ']']
					if (!info[name]) info[name] = ''
					if (info[name].length == 0 && tag) info[name] = '0'
				}
				arr.push(info)
				
				++idx
			}
		}
		return arr
	}
	
	this.normalizeData = function(data, callback) {
		async.waterfall([
			function(callback) {
				let result = {}
				
				result.name = data.name
				
				result.definedId = data.definedId
				if (!data.definedId) result.definedId = ''
				
				result.sciname = data.sciname
				if (!data.sciname) result.sciname = ''
				
				result.type = data.type
				if (!data.type) result.type = ''
				
				result.diameterMin = data.diameterMin
				if (!data.diameterMin || data.diameterMin.length == 0) result.diameterMin = '0'
				result.diameterMax = data.diameterMax
				if (!data.diameterMax || data.diameterMax.length == 0) result.diameterMax = '0'
				
				result.heightMin = data.heightMin
				if (!data.heightMin || data.heightMin.length == 0) result.heightMin = '0'
				result.heightMax = data.heightMax
				if (!data.heightMax || data.heightMax.length == 0) result.heightMax = '0'
				
				result.widthMin = data.widthMin
				if (!data.widthMin || data.widthMin.length == 0) result.widthMin = '0'
				result.widthMax = data.widthMax
				if (!data.widthMax || data.widthMax.length == 0) result.widthMax = '0'
				
				result.tolerance = data.tolerance
				if (!data.tolerance || data.tolerance.length == 0) result.tolerance = '0'
				
				result.timeMin = data.timeMin
				if (!data.timeMin || data.timeMin.length == 0) result.timeMin = '0'
				result.timeMax = data.timeMax
				if (!data.timeMax || data.timeMax.length == 0) result.timeMax = '0'
				
				result.petal = data.petal
				if (!data.petal) result.petal= ''
				
				if (data.numPetals && data.numPetals.length > 0) result.numPetals = data.numPetals
				else result.numPetals = "0"
				
				
				
				result.numPetalType = data.numPetalType
				if (!data.numPetalType) result.numPetalType = ''
				
				result.bloom = data.bloom
				if (!data.bloom) result.bloom = ''
				
				result.fragrance = data.fragrance
				if (!data.fragrance) result.fragrance = ''
				
				result.note = data.note
				if (!data.note) result.note = ''
				
				result.origins = parseDataToArray("origins", data, ['name', 'year'], true)
				result.techInfo = parseDataToArray("techInfo", data, ['age', 'moisMin', 'moisMax', 'tempMin', 'tempMax', 'pHMin', 'pHMax', 'ECMin', 'ECMax', 'solarMin', 'solarMax'], true)
				result.pests = parseDataToArray("pests", data, ['name', 'agent', 'sign', 'solution'], false)
				result.colors = parseDataToArray("colors", data, ['name', 'hex'], true)
				result.growth = parseDataToArray("growth", data, ['age', 'tolerance', 'height', 'width', 'budTime', 'numBuds', 'flowerTime', 'numFlowers', 'diameter', 'numPetals', 'time', 'fragrance'], true)
				
				let imageNames = data["imgNames[]"]
				if (imageNames) {
					if (imageNames instanceof Array) {
						result.imageNames = imageNames
					} else {
						result.imageNames = new Array(imageNames)
					}
				}
				result.mainImgName = data.mainImgName
				if (!data.mainImgName) result.mainImgName = ''
				
				callback(null, result)
			}
		], function(err, result) {
			callback(err, result)
		})
	}
}
