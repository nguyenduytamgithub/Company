var express = require('express'),
	router = express.Router(),
	security = require('../../models/middleware/security.js'),
	rose = require('../../controllers/admin/rose.js'),
	multer = require('multer'),
	upload = multer( { dest: './public/images/temp/' } )

router.get('/', [security.checkAdminLogin, security.checkAdminRole], rose.showStatsPage)
router.get('/list', [security.checkAdminLogin, security.checkAdminRole], rose.showAllRosesPage)
router.get('/add', [security.checkAdminLogin, security.checkAdminRole], rose.showAddPage)
router.get('/detail/:roseId', [security.checkAdminLogin, security.checkAdminRole], rose.showModifyPage)
router.get('/detail/view/:roseId', [security.checkAdminLogin, security.checkAdminRole], rose.showDetailViewPage)
router.get('/review/:roseId', [security.checkAdminLogin, security.checkAdminRole], rose.showReviewPage)

router.get('/pend-list', [security.checkAdminLogin, security.checkAdminRole], rose.showAllPendRosesPage)
router.get('/approve/:roseId', [security.checkAdminLogin, security.checkAdminRole], rose.showApprovePage)
router.get('/approve/view/:roseId', [security.checkAdminLogin, security.checkAdminRole], rose.showApproveViewPage)
router.post('/accept', [security.checkAdminLogin, security.checkAdminRole], rose.accept)
router.post('/reject', [security.checkAdminLogin, security.checkAdminRole], rose.reject)

router.post('/add', [security.checkAdminLogin, security.checkAdminRole], rose.addRose)
router.post('/update', [security.checkAdminLogin, security.checkAdminRole], rose.updateRose)
router.post('/delete', [security.checkAdminLogin, security.checkAdminRole], rose.deleteRose)
router.post('/review', [security.checkAdminLogin, security.checkAdminRole], rose.addReview)

router.post('/image/upload/:userId', [security.checkAdminLogin, security.checkAdminRole, upload.single('file')], rose.uploadImage)
router.post('/image/undo/:userId', [security.checkAdminLogin, security.checkAdminRole], rose.undoImage)

module.exports = router
