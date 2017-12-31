var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    hbs = require('hbs'),
    passport = require('passport'),
    file = require('./models/file.js')


var adminIndex = require('./routes/admin/index'),
    adminAccount = require('./routes/admin/account'),
    adminRose = require('./routes/admin/rose'),
    adminAPI = require('./routes/admin/api'),
    adminArea = require('./routes/admin/area')

var index = require('./routes/index'),
    rose = require('./routes/user/rose'),
    users = require('./routes/users'),
    api = require('./routes/user/api')

var app = express()

// Create default directories
file.createFolder('./public')
file.createFolder('./public/js')
file.createFolder('./public/css')
file.createFolder('./public/images')
file.createFolder('./public/images/rose')
file.createFolder('./public/images/pendrose')
file.createFolder('./review')
file.createFolder('./review/rose')
file.createFolder('./review/pendrose')

// Public host
// var ngrok = require('ngrok')
// ngrok.connect(3000, function (err, url) {
    // console.log("Host at: " + url)
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Session
app.use(require('express-session')({
    secret: 'keyboard comaybachhoa',
    name: 'CoMayBachHoa',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1200000 } // 1200000ms = 20 minutes
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/admin', adminIndex)
app.use('/admin/account', adminAccount)
app.use('/admin/rose', adminRose)
app.use('/admin/api', adminAPI)
app.use('/admin/area', adminArea)

app.use('/', index)
app.use('/rose', rose)
app.use('/users', users)
app.use('/api', api)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

hbs.registerPartials(__dirname + '/views/partials')

var blocks = {}

hbs.registerHelper('extend', function(name, context) {
    var block = blocks[name]
    if (!block) {
        block = blocks[name] = []
    }

    block.push(context.fn(this)) // for older versions of handlebars, use block.push(context(this))
})

hbs.registerHelper('block', function(name) {
    var val = (blocks[name] || []).join('\n')

    // clear the block
    blocks[name] = []
    return val
})

hbs.registerHelper('configPartial', function(data, options) {
	return options.fn(JSON.parse(data))
})

hbs.registerHelper('ifEqual', function(v1, v2, options) {
	if(v1 === v2) {
		return options.fn(this)
	}
	return options.inverse(this)
})

hbs.registerHelper('ifIntersect', function(v1, v2, options) {
	if (v1 instanceof Array) {
		var arr1 = v1
	} else {
		v1 = v1.replace('[', '').replace(']', '')
		var arr1 = v1.split(',').map(v => v.trim())
	}
	
	if (v2 instanceof Array) {
		var arr2 = v2
	} else {
		v2 = v2.replace('[', '').replace(']', '')
		var arr2 = v2.split(',').map(v => v.trim())
	}
	
	let arr = arr2.filter(v => arr1.includes(v))
	if(arr.length > 0) {
		return options.fn(this)
	}
	return options.inverse(this)
})

module.exports = app
