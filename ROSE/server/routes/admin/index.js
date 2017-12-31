var express = require('express'),
	router = express.Router(),
	index = require('../../controllers/admin/index.js')

router.get('/', index.showLoginPage)
router.get('/logout', index.logout)
router.post('/', index.login)
router.get('/pswd/forgot', index.showForgotPwdPage)
router.post('/pswd/forgot', index.processForgotPwd)

module.exports = router
