const db = require('./../../db/pgpool')
var pool = db.getPool()

function getAllStations(callback) {
    pool.query('SELECT * FROM stations;', function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}
function insertStation(settings, callback) {
    // console.log('inserting these params into stations table: ', settings)
    pool.query('INSERT INTO stations(id, station_name, lattitude, longitude, province_name, address, city_name) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;', settings, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

function deleteStation(id, callback) {
    pool.query('DELETE FROM stations WHERE id = $1', [id], function (err, res) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function isNotNull(item) {
    if(item !== null && item.city !== null && item.city.name !== null && item.city.commune.provinceName !== 'undefined'){
        // console.log('not null');
        return item
    }
} 


exports.getAllStations = getAllStations
exports.insertStation = insertStation
exports.deleteStation = deleteStation
exports.isNotNull = isNotNull