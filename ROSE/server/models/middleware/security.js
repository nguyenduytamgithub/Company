// MODEL (MIDDLEWARE)

var dbAccount = require('../db/account.js'),
	acl = dbAccount.acl,
	role = dbAccount.roles

acl.addRoleParents(role.supertech, role.tech) // supertech is stech's tech
acl.addRoleParents(role.tech, role.guest)

acl.allow(role.manager, '/admin/rose/list', 'GET')
acl.allow(role.manager, '/admin/rose/pend-list', 'GET')
acl.allow(role.manager, '/admin/rose/detail/view', 'GET')
acl.allow(role.manager, '/admin/rose/approve/view', 'GET')
acl.allow(role.manager, '/admin/area/list', 'GET')
acl.allow(role.manager, '/admin/area/detail', 'GET')

acl.allow(role.supertech, '/admin/rose/approve', 'GET')
acl.allow(role.supertech, '/admin/rose/delete', 'POST')
acl.allow(role.supertech, '/admin/rose/accept', 'POST')
acl.allow(role.supertech, '/admin/rose/reject', 'POST')

acl.allow(role.tech, '/admin/rose/pend-list', 'GET')
acl.allow(role.tech, '/admin/rose/list', 'GET')
acl.allow(role.tech, '/admin/rose/add', ['GET', 'POST'])
acl.allow(role.tech, '/admin/rose/detail', 'GET')
acl.allow(role.tech, '/admin/rose/detail/view', 'GET')
acl.allow(role.tech, '/admin/rose/approve/view', 'GET')
acl.allow(role.tech, '/admin/rose/update', 'POST')
acl.allow(role.tech, '/admin/rose/review', ['GET', 'POST'])
acl.allow(role.tech, '/admin/rose/image/upload', 'POST')
acl.allow(role.tech, '/admin/rose/image/undo', 'POST')
acl.allow(role.tech, '/admin/area/list', 'GET')
acl.allow(role.tech, '/admin/area/detail', 'GET')

let links = [
	{ url: '/admin/rose/detail', methods: ['GET'] },
	{ url: '/admin/rose/detail/view', methods: ['GET'] },
	{ url: '/admin/rose/approve/view', methods: ['GET'] },
	{ url: '/admin/rose/approve', methods: ['GET'] },
	{ url: '/admin/rose/image/undo', methods: ['POST'] },
	{ url: '/admin/rose/review', methods: ['GET'] },
	{ url: '/admin/rose/image/upload', methods: ['POST'] },
	{ url: '/admin/area/detail', methods: ['GET'] }
]

exports.checkAdminLogin = function(req, res, next) {
	if (req.user) {
		return next()
	}
	
	if (req.method == "POST") {
		return res.send({
			err: {
				title: 'Có lỗi xảy ra',
				msg: 'Bạn đã hết thời gian đăng nhập. Hãy nhấn F5 để refresh trang và đăng nhập lại'
			}
		})
	}
	res.redirect("/admin")
}

exports.checkAdminRole = function(req, res, next) {
	let method = req.method
	let url = req.originalUrl
	
	let flt = links.filter( v => {
		return (url.indexOf(v.url) == 0) && (v.methods.indexOf(method) > -1)
	})
	if (flt.length > 0) {
		url = url.substr(0, url.lastIndexOf('/'))
	}
	
	acl.isAllowed(req.user.id, url, method, function(err, result){
		if(result) {
			return next()
		}
		req.logout()
		res.redirect("/admin")
	})
}
