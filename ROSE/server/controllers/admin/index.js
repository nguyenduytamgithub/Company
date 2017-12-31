// CONTROLLER (ADMIN)

var async = require('async'),
	dbAccount = require('../../models/db/account.js')

exports.showLoginPage = function(req, res) {
	if (req.user) {
		return res.redirect('/admin/rose/list')
	}
	
	res.render('admin/account/login', {
		layout: 'admin/layout',
		title: 'Đăng nhập admin'
	})
}

exports.login = function(req, res) {
	dbAccount.verifyAccount(req.body.username, req.body.pswd, function(err, user) {
		if (err) return res.send(err)
		req.login(user, loginErr => {
			if (loginErr) {
				return res.send(loginErr)
			}
			return res.send(null)
		}) 
	})
}

exports.logout = function (req, res) {
    req.logout()
    res.redirect('/admin')
}

exports.showForgotPwdPage = function(req, res) {
	// hiển thị trang nhập username của tài khoản quên mật khẩu
}

exports.processForgotPwd = function(req, res) {
	// gửi mail đổi password
}
