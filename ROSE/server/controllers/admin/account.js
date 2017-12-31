// CONTROLLER (ADMIN)

var async = require('async'),
	dbAccount = require('../../models/db/account.js')

exports.showInfoPage = function(req, res) {
	
}

exports.showResetPwdPage = function(req, res) {
	let resetID = req.params.id
	if (resetID) { // request reset from email (user forgot password)
		
	} else {
		
	}
}

exports.resetPwd = function(req, res) {
	
}
