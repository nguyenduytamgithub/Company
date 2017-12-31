// MODEL (DB)

var mysql = require('mysql'),
	async = require('async'),
	db = require('./base.js'),
	pool = db.dbAccPool, // connections pool
	crypto = require('crypto'),
	guard = require('../guard.js'),
	acl = require('acl'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy
	
acl = new acl(new acl.memoryBackend())
exports.acl = acl

exports.roles = {
	guest: 'guest',
	tech: 'tech',
	supertech: 'stech',
	manager: 'manager'	
}

passport.serializeUser(function(user, done) {
	done(null, user.id)
})

// used to deserialize the user
passport.deserializeUser(function(id, done) {
	async.parallel({
		roles: function(callback) {
			let sql = "SELECT r.name as role FROM CMAcc.AccountRole ar JOIN CMAcc.Role r ON ar.account=? AND r.id=ar.role"
			pool.query(sql, id, function(err,rows) {
				let roles = rows.map(val => val.role)
				acl.addUserRoles(id, roles)
				callback(err, roles)
			})
		},
		account: function(callback) {
			let sql = "SELECT * FROM CMAcc.Account WHERE id=?"
			pool.query(sql, id, function(err,rows) {
				callback(err, rows[0])
			})
		}
	}, function(err, result) {
		result.account.roles = result.roles
		done(err, result.account) // save account to req.user
	})
})


var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') 		/** convert to hexadecimal format */
            .slice(0, length)   	/** return required number of characters */
}

var sha512 = function(pswd, salt){
    var hash = crypto.createHmac('sha512', salt) /** Hashing algorithm sha512 */
    hash.update(pswd)
    var value = hash.digest('hex')
    return {
        salt: salt,
        pswd: value
    }
}

function saltHashPassword (pswd) {
    var salt = genRandomString(16) /** Gives us salt of length 16 */
    return sha512(pswd, salt)
}

////////////////////////////////////////////////////////////////////////////////
//---------------------------Add account's information---------------------------//
////////////////////////////////////////////////////////////////////////////////

function register (username, pswd, role, callback) {
	async.waterfall([
		function(callback) {
			let sql = "SELECT COUNT(username) as count FROM CMAcc.Account WHERE username=?"
			pool.query(sql, username, (err, rows, fields) => {
				if (rows && rows[0]['count'] > 0) {
					callback("Tên đăng nhập đã tồn tại")
				} else {
					callback(err)
				}
			})
		},
		function(callback) {
			let hashed = saltHashPassword(pswd)
			let sql = "CALL CMAcc.InsertAccount(?, ?, ?)"
			pool.query(sql, [username, hashed.pswd, hashed.salt], (err, rows, fields) => {
				callback(err, {hashed: hashed, id: rows[0][0].id})
			})
		},
		function(result, callback) {
			let sql = "CALL CMAcc.InsertAccountRole(?, ?)"
			pool.query(sql, [result.id, role], (err, rows, fields) => {
				callback(err, result)
			})
		}
	], function(err, result) {
		callback(err, result)
	})
}
exports.register = register

function verify (username, pswd, callback) {
	async.waterfall([
		function(callback) {
			let sql = "SELECT * FROM CMAcc.Account WHERE username=?"
			pool.query(sql, username, (err, rows, fields) => {
				if (!rows || rows.length == 0) {
					return callback("Tên đăng nhập hoặc mật khẩu không chính xác")
				}
				callback(null, rows[0])
			})
		},
		function(stored, callback) {
			let hashed = sha512(pswd, stored.salt)
			if (hashed.pswd == stored.pswd) {
				return callback(null, stored)
			}
			callback("Tên đăng nhập hoặc mật khẩu không chính xác")
		}
	], function(err, user) {
		callback(err, user)
	})
}

exports.verifyAccount = function(username, pswd, callback) {
	async.waterfall([
		function(callback) {
			let err = guard.guardNotEmpty([
				{key: 'Tên đăng nhập', value: username},
				{key: 'Mật khẩu', value: pswd}
			])
			callback(err)
		},
		function(callback) {
			verify(username, pswd, function(err, user) {
				callback(err, user)
			})
		}
	],
	function(err, user) {
		callback(err, user)
	})
}
