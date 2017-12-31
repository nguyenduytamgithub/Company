var express = require('express'),
	router = express.Router(),
	security = require('../../models/middleware/security.js'),
	api = require('../../controllers/admin/api.js')

router.get('/rose/detail/:roseId', api.getRose)
router.get('/rose/list', api.getRosesList)
router.get('/pend-rose/detail/:roseId', api.getPendRose)
router.get('/pend-rose/list', api.getPendRosesList)
router.get('/area/detail/:areaId', api.getArea)
router.get('/rose/general', api.getGeneralInfo)
router.get('/test', api.test)

router.post('/data', api.processData)

module.exports = router
