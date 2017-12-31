var express = require('express'),
	router = express.Router(),
	security = require('../../models/middleware/security.js'),
	account = require('../../controllers/admin/account.js')

router.get('/info', account.showInfoPage)
router.get('/pwd/reset', [security.checkAdminLogin], account.showResetPwdPage)
router.get('/pwd/reset/:id', account.showResetPwdPage)
router.post('/pwd/reset', [security.checkAdminLogin], account.resetPwd)

module.exports = router
