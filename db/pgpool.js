require('dotenv').config()

var pg = require('pg');
var pool;
let createDb = require('./createDb.js')

var config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DBNAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT
}

module.exports = {
  getPool: function () {
    if (pool) 
      return pool; // if it is already there, grab it here
    //else(if not existed)create new db
    pool = new pg.Pool(config)
    // pool.query(createDb.mStations, (err, res) => err?console.log(err):console.log(res))
    // pool.query(createDb.mSensors,  (err, res) => err?console.log(err):console.log(res))
    // pool.query(createDb.mData,  (err, res) => err?console.log(err):console.log(res))
    // pool.query(createDb.mAirQuality, (err, res)=>err?console.log(err):console.log(res))  
    
    pool.query(createDb.mStations, (err, res) => err?console.log(err):null)
    pool.query(createDb.mSensors,  (err, res) => err?console.log(err):null)
    pool.query(createDb.mData,  (err, res) => err?console.log(err):null)
    pool.query(createDb.mAirQuality, (err, res)=>err?console.log(err):null)
    return pool;
    }
}