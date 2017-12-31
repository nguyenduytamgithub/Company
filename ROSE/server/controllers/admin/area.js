let dbRose = require('../../models/db/rose.js')

exports.showArea = function(req, res) {
	let userId = '1412573'
	let username = 'Tri Dao'
	res.render('admin/rose/area', {
		layout: 'admin/layout',
		title: 'Khu vực ' + req.params.areaId,
		name: 'Thư Viện giống Hoa hồng Sadec',
		username: username,
		userId: userId,
		areaId: req.params.areaId,
		roles: req.user.roles,
		messages: [{
			link: '/admin',
			time: 'Hôm qua, 10:15:30 AM',
			content: 'Độ ẩm trong nhà màng NMR1 đã vượt ngưỡng tối đa cho phép.'
		}]
	})
}
