const db = require('./../../db/pgpool')
var pool = db.getPool()

function insertData(settings, callback) {
    // console.log('inserting these values to sensors table: ', settings);
    pool.query('INSERT INTO data(id, date, value) VALUES($1, $2, $3) RETURNING *;', settings, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}

exports.insertData = insertData