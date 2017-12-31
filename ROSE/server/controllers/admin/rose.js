// CONTROLLER (ADMIN)

var async = require('async'),
	dbAccount = require('../../models/db/account.js'),
	dbRose = require('../../models/db/rose.js'),
	dbPendRose = require('../../models/db/pendrose.js'),
	dbLog = require('../../models/db/log.js'),
	guard = require('../../models/guard.js'),
	rand = require('../../models/random.js'),
	fileModel = require('../../models/file.js')


exports.showStatsPage = function(req, res) {
	res.render('admin/rose/stats', {
		layout: 'admin/layout',
		title: 'Trang chủ',
		name: 'Thư viện giống hoa hồng',
		roles: req.user.roles,
		messages: [{
			link: '/admin',
			time: 'Hôm qua, 10:15:30 AM',
			content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
		}]
	})
}

exports.showAllRosesPage = function(req, res) {
	res.render('admin/rose/list', {
		layout: 'admin/layout',
		title: 'Danh sách giống hoa hồng',
		name: 'Thư viện giống hoa hồng',
		roles: req.user.roles,
		messages: [{
			link: '/admin',
			time: 'Hôm qua, 10:15:30 AM',
			content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
		}]
	})
}

exports.showAddPage = function(req, res) {
	let userId = req.user.id
	
	fileModel.removeFiles('./public/images/temp/', function(fileName) {
		return fileName.startsWith(userId)
	})
	
	res.render('admin/rose/detail', {
		layout: 'admin/layout',
		title: 'Thêm giống hoa hồng',
		name: 'Thư viện giống hoa hồng',
		userId: userId,
		submitLink: '/admin/rose/add',
		roles: req.user.roles,
		messages: [{
			link: '/admin',
			time: 'Hôm qua, 10:15:30 AM',
			content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
		}]
	})
	
}

exports.showModifyPage = function(req, res) {
	dbRose.guardExistsId(req.params.roseId, function(err) {
		if (err) return res.redirect('/admin/rose/list')
		res.render('admin/rose/detail', {
			layout: 'admin/layout',
			title: 'Cập nhật giống hoa hồng',
			name: 'Thư viện giống hoa hồng',
			userId: req.user.id,
			roseId: req.params.roseId,
			submitLink: '/admin/rose/update',
			deleteLink: '/admin/rose/delete',
			roles: req.user.roles,
			messages: [{
				link: '/admin',
				time: 'Hôm qua, 10:15:30 AM',
				content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
			}]
		})
	})
}

exports.showDetailViewPage = function(req, res) {
	dbRose.guardExistsId(req.params.roseId, function(err) {
		if (err) return res.redirect('/admin/rose/list')
		res.render('admin/rose/detail-view', {
			layout: 'admin/layout',
			title: 'Thông tin giống hoa',
			name: 'Thư viện giống hoa hồng',
			userId: req.user.id,
			roseId: req.params.roseId,
			roles: req.user.roles,
			messages: [{
				link: '/admin',
				time: 'Hôm qua, 10:15:30 AM',
				content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
			}]
		})
	})
}

exports.showReviewPage = function(req, res) {
	dbRose.guardExistsId(req.params.roseId, function(err) {
		if (err) return res.redirect('/admin/rose/list')
		dbRose.getRoseImgNames(req.params.roseId, function (err, imgNames) {
			res.render('admin/rose/review', {
				layout: 'admin/layout',
				title: 'Viết bài cho giống hoa',
				name: 'Thư viện giống hoa hồng',
				userId: req.user.id,
				roseId: req.params.roseId,
				imgSrcs: imgNames,
				roles: req.user.roles,
				messages: [{
					link: '/admin',
					time: 'Hôm qua, 10:15:30 AM',
					content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
				}]
			})
		})
	})
}

exports.showAllPendRosesPage = function(req, res) {
	res.render('admin/rose/pendlist', {
		layout: 'admin/layout',
		title: 'Danh sách giống hoa hồng',
		name: 'Thư viện giống hoa hồng',
		roles: req.user.roles,
		messages: [{
			link: '/admin',
			time: 'Hôm qua, 10:15:30 AM',
			content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
		}]
	})
}

exports.showApprovePage = function(req, res) {
	dbPendRose.guardExistsId(req.params.roseId, function(err) {
		if (err) return res.redirect('/admin/rose/pend-list')
		res.render('admin/rose/detail-view', {
			layout: 'admin/layout',
			title: 'Xét duyệt giống hoa',
			name: 'Thư viện giống hoa hồng',
			userId: req.user.id,
			roseId: req.params.roseId,
			approve: true,
			roles: req.user.roles,
			messages: [{
				link: '/admin',
				time: 'Hôm qua, 10:15:30 AM',
				content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
			}]
		})
	})
}

exports.showApproveViewPage = function(req, res) {
	dbPendRose.guardExistsId(req.params.roseId, function(err) {
		if (err) return res.redirect('/admin/rose/pend-list')
		res.render('admin/rose/detail-view', {
			layout: 'admin/layout',
			title: 'Xét duyệt giống hoa',
			name: 'Thư viện giống hoa hồng',
			userId: req.user.id,
			roseId: req.params.roseId,
			approve: true,
			roles: req.user.roles,
			messages: [{
				link: '/admin',
				time: 'Hôm qua, 10:15:30 AM',
				content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
			}]
		})
	})
}

exports.accept = function(req, res) {
	let roseId = req.body.roseId
	dbPendRose.accept(roseId, function(err) {
		if (err) {
			res.send({
				err: {
					title: 'Có lỗi xảy ra',
					msg: err
				},
				url: '/admin/rose/add'
			})
		} else {
			dbLog.writeFlowerLog(req.user.id, roseId, dbLog.action.approve, '', (err) => {
				res.send({
					url: '/admin/rose/pend-list'
				})
			})
		}
	})
}

exports.reject = function(req, res) {
	let roseId = req.body.roseId
	dbPendRose.reject(roseId, function(err) {
		if (err) {
			res.send({
				err: {
					title: 'Có lỗi xảy ra',
					msg: err
				},
				url: '/admin/rose/add'
			})
		} else {
			dbLog.writeFlowerLog(req.user.id, roseId, dbLog.action.reject, '', (err) => {
				res.send({
					url: '/admin/rose/pend-list'
				})
			})
		}
	})
}

exports.addRose = function(req, res) {
	guard.guardAddValidRose(req.body, function(err) {
		if (err) {
			res.send({
				err: {
					title: 'Có lỗi xảy ra',
					msg: err
				},
				url: '/admin/rose/add'
			})
		} else {
			async.waterfall([
				function(callback) {
					let roles = req.user.roles
					if (roles.indexOf(dbAccount.roles.supertech) > -1) {
						dbRose.normalizeData(req.body, function(err, result) {
							dbRose.addRoseInfo(result, function(err, roseId) {
								callback(err, '/admin/rose/add', roseId)
							})
						})
					} else {
						dbPendRose.normalizeData(req.body, function(err, result) {
							dbPendRose.addRoseInfo(result, function(err, roseId) {
								callback(err, '/admin/rose/add', roseId)
							})
						})
					}
				},
				function(url, roseId, callback) {
					dbLog.writeFlowerLog(req.user.id, roseId, dbLog.action.add, '', (err) => {
						callback(err, url)
					})
				} 
			],
			function(err, url) {
				res.send({
					url: url
				})
			})
		}
	})
}

exports.updateRose = function(req, res) {
	guard.guardUpdateValidRose(req.body, function(err) {
		if (err) {
			res.send({
				err: {
					title: 'Có lỗi xảy ra',
					msg: err
				},
				url: '/admin/rose/list'
			})
		} else {
			async.waterfall([
				function(callback) {
					let roles = req.user.roles
					if (roles.indexOf(dbAccount.roles.supertech) > -1) {
						dbRose.normalizeData(req.body, function(err, result) {
							dbRose.updateRoseInfo(req.body.roseId, result, () => {
								callback(err, '/admin/rose/list')
							})
						})
					} else {
						dbPendRose.normalizeData(req.body, function(err, result) {
							dbPendRose.updateRoseInfo(req.body.roseId, result, () => {
								callback(err, '/admin/rose/list')
							})
						})
					}
				},
				function(url, callback) {
					dbLog.writeFlowerLog(req.user.id, req.body.roseId, dbLog.action.update, '', (err) => {
						callback(err, url)
					})
				}
			], function(err, url) {
				res.send({
					url: url
				})
			})
		}
	})
}

exports.deleteRose = function(req, res) {
	dbRose.delRoseInfo(req.body.roseId, () => {
		dbLog.writeFlowerLog(req.user.id, req.body.roseId, dbLog.action.delete, '', (err) => {
			res.send({
				url: '/admin/rose/list'
			})
		})
	})
}

exports.addReview = function(req, res) {
	async.waterfall([
		function(callback) {
			dbRose.guardExistsId(req.body.roseId, callback)
		},
		function(callback) {
			dbRose.writeFlowerReview(req.body.roseId, req.body.review)(
				function(err, roseId) {
					if (err) return callback( "Cập nhật bài viết không thành công", roseId)
					callback(null, roseId)
				}
			)
		}
	], function(err, result) {
		if (err) {
			res.send({
				err: {
					title: 'Có lỗi xảy ra',
					msg: err
				},
				url: '/admin/rose/list'
			})
		} else {
			res.send({
				url: '/admin/rose/list'
			})
		}
	})
}

exports.uploadImage = function(req, res) {
	let userId = req.params.userId
	let file = req.file
	let fromPath = file.path
	let newName = userId + '-' + rand.makeId(50)
	let toPath = fromPath.replace(file.filename, newName)
	fileModel.rename(fromPath, toPath)
	
	res.send(newName)
}

exports.undoImage = function(req, res) {
	let folder = './public/images/temp/'
	fileModel.remove(folder + req.body.filename, function(err) {
		res.send("OK")
	})
}
