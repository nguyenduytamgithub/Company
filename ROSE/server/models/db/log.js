var db = require('./base.js'),
	pool = db.dbLogPool,
    config = db.dbLogConfig

exports.action = {
    add: 'add',
    update: 'update',
    delete: 'delete',
    approve: 'approve',
    reject: 'reject'
}

exports.writeFlowerLog = function(userId, flowerId, actionType, reason, callback) {
    let sql = "CALL WriteLog(?, ?, ?, ?)"
    if (!reason) reason = ''
    pool.query(sql, [userId, flowerId, actionType, reason], (err, rows, fields) => {
        callback(err)
    })
}

exports.getLastLog = function(flowerId, callback) {
    let sql = "CALL GetLastLog(?)"
    pool.query(sql, flowerId, (err, rows, fields) => {
        callback(err, rows[0])
    })
}

exports.refreshIfNeed = function(callback) {
    let sql = "CALL Refresh()"
    pool.query(sql, (err, rows, fields) => {
        callback(err)
    })
}
