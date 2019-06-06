const db = require('./../../db/pgpool')
var pool = db.getPool()

function insertAirQuality(settings, callback) {
    // console.log('inserting these params into air-quality table: ', settings)
    pool.query('INSERT INTO airquality(id_station,date,value) VALUES($1, $2, $3) RETURNING *;', settings, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}


exports.insertAirQuality = insertAirQuality