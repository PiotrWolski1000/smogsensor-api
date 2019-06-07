const db = require('./../../db/pgpool')
var pool = db.getPool()

function insertSensor(settings, callback) {
    // console.log('inserting these values to sensors table: ', settings);
    pool.query('INSERT INTO sensors(id, id_station, parameter_name, formula_name) VALUES($1, $2, $3, $4) RETURNING *;', settings, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

exports.insertSensor = insertSensor