var async = require('async'),
	dbRose = require('../../models/db/rose.js');

exports.getRoseReview = function(req, res) {
	let roseId = req.params.roseId
	async.parallel({
		definedId: function (callback) {
			dbRose.getDefinedRoseId(roseId, function(err, definedId) {
				callback(null, definedId)
			})
		},
		review: function (callback) {
			dbRose.getRoseReview(roseId, function(err, review) {
				callback(null, review)
			});
		}
	},
	function(err, result) {
		if (err) res.send("");
		res.send(result);
	})
}
