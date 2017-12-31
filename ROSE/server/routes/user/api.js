let express = require('express')
let router = express.Router()
let api = require('../../controllers/user/api.js')


router.get('/review/:roseId', api.getRoseReview)

module.exports = router
