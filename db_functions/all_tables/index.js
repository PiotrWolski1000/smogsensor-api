const db = require('./../../db/pgpool')
var pool = db.getPool()


function deleteTableStations(callback) {
    pool.query('DROP TABLE stations;', function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

function deleteTableSensors(callback) {
    pool.query('DROP TABLE sensors;', function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

function deleteTableAirQuality(callback) {
    pool.query('DROP TABLE airquality;', function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

function deleteTableData(callback) {
    pool.query('DROP TABLE data;', function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

exports.deleteTableStations = deleteTableStations
exports.deleteTableSensors = deleteTableSensors
exports.deleteTableData = deleteTableData
exports.deleteTableAirQuality = deleteTableAirQuality