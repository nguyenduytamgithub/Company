var express = require('express')
var router = express.Router()
let dbRose = require('../models/db/rose.js')

/* GET home page. */
router.get('/', function(req, res, next) {
	res.redirect('/rose/list')
})

module.exports = router
