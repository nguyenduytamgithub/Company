let express = require('express')
let router = express.Router()

let security = require('../../models/middleware/security.js')
let area = require('../../controllers/admin/area.js')

router.get('/detail/:areaId', [security.checkAdminLogin, security.checkAdminRole], area.showArea)

module.exports = router
