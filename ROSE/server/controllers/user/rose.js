// CONTROLLER

let dbRose = require('../../models/db/rose.js');

exports.getAllRoses = function(req, res) {
	dbRose.getRosesList(function(err, results) {
		if (err) {
			return res.send(error);
		}
		res.render('user/rose/list', {
			layout: 'user/layout',
			title: 'Cỏ may bách hoa',
			name: 'Thư viện giống hoa hồng',
			roses: results
		});
	});
}

exports.getRose = function(req, res) {
	dbRose.getRoseInfo(req.params.roseID, function(err, results) {
		if (err) {
			return res.send(error);
		}
		return res.send(results);
	});
}
