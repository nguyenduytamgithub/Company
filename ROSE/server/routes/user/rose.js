let express = require('express')
let router = express.Router()
let security = require('../../models/middleware/security.js')
let rose = require('../../controllers/user/rose.js')

router.get('/list', rose.getAllRoses)
router.get('/detail/:roseID', rose.getRose)

module.exports = router
