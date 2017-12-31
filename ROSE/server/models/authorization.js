var accountModel = require('./account')
var ACCOUNT_TYPE = accountModel.TYPE

var constraints = {
    '/admin/account/register-manager': [accountModel.getRoleID(ACCOUNT_TYPE.SUPER)],
    '/admin/account/register': [accountModel.getRoleID(ACCOUNT_TYPE.MANAGER), accountModel.getRoleID(ACCOUNT_TYPE.SUPER)],
    '/admin/account/list': [accountModel.getRoleID(ACCOUNT_TYPE.MANAGER), accountModel.getRoleID(ACCOUNT_TYPE.SUPER)],
    '/admin': [accountModel.getRoleID(ACCOUNT_TYPE.STAFF), accountModel.getRoleID(ACCOUNT_TYPE.MANAGER), accountModel.getRoleID(ACCOUNT_TYPE.SUPER)],
    '/checkout': [accountModel.getRoleID(ACCOUNT_TYPE.GUEST)]
}


exports.checkAuth = function(req) {
    var url = req.originalUrl
    for (var c in constraints) {
        if (url.indexOf(c) != -1) {
            return constraints[c].indexOf(req.user.role) != -1
        }
    }
    return true
}

exports.checkAdminExpiration = function(req) {
    return !req.user
}

exports.checkExpiration = function(req) {
    return !req.user
}
