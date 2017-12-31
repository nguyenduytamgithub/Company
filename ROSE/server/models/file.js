let fs = require('fs')

exports.sizeOf = require('image-size')

exports.getFileSize = function(path) {
	if (isExisted(path)) {
		const stats = fs.statSync(path)
		return stats.size // bytes
	}
	return 0
}

exports.rename = function(fromPath, toPath, callback) {
	if (isExisted(fromPath)) {
		fs.rename(fromPath, toPath, function(err) {
			if (callback) callback(err)
		})
	}
	else callback(null)
}

exports.removeFiles = function(dir, filter) {
	if (!isExisted(dir)) fs.mkdirSync(dir)
	
	var files = fs.readdirSync(dir)
	var count = 0
	for(idx in files) {
		var fileName = files[idx]
		if (filter(fileName)) fs.unlinkSync(dir + fileName)
	}
}

exports.remove = function(path, callback) {
	if (isExisted(path)) {
		fs.unlink(path,function(err){
			if (callback) callback(err)
		})
	}
	else callback(null)
}

exports.write = function(path, content, callback) {
	fs.writeFile(path, content, function(err) {
		if (callback) callback(err)
	})
}

exports.read = function(path, callback) {
	if (isExisted(path)) {
		fs.readFile(path, 'utf8', function(err, data) {
			if (callback) callback(err, data)
		})
	}
	else callback(null)
}

function isExisted(path) {
	return fs.existsSync(path)
}
exports.isExisted = isExisted

exports.copyFile = function(fromPath, toPath) {
	if (isExisted(fromPath)) {
		fs.createReadStream(fromPath).pipe(fs.createWriteStream(toPath))
	}
}

exports.createFolder = function(dir) {
	if (!isExisted(dir)) {
		fs.mkdirSync(dir)
	}
}
