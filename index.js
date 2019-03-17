const axios = require('axios')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const pg = require('pg');
const Pool = pg.Pool;

var router = express.Router();

router.all('*',function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*")
    req.header("Content-Type", "application/json")    
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Content-Type, X-Requested-With")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS")
    next()  ;//lec do kolejnego sita! 
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

let port = 3000;

app.get('/', function (req, res) {
    res.send('Hello in SmogSensor API')
})

app.listen(port, function () {
    console.log('Server started, navigate to: ', port)
})

const pool = new Pool({
    user: 'postgres',
    host: 'postgres.localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
})

pool.query('SELECT NOW()', function (err, res) {
    // console.log(res)
    // pool.end()
})

const createTableStations = `
    CREATE TABLE IF NOT EXISTS stations(
        id SERIAL PRIMARY KEY,
        id_station integer,
        stationName VARCHAR(255) NOT NULL,
        gegrLat VARCHAR(255) NOT NULL,
        gegrLon VARCHAR(255) NOT NULL,
        cityName VARCHAR(255) NOT NULL,
        addressStreet VARCHAR(255)
    );        
`;
    
const createTableStationsData = `
    CREATE TABLE IF NOT EXISTS station_data(
        id SERIAL PRIMARY KEY,
        station_id INT references stations(id_station),
        pm10 INT,
        no2 INT,
        date  date
    );
` 


pool.query(createTableStations, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        // console.log(res);
    }
});

pool.query(createTableStationsData, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        // console.log(res);
    }
});

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
    console.log('inserting these params into stations table: ', settings)
    pool.query('INSERT INTO stations(id_station,stationName,gegrLat,gegrLon,cityName,addressStreet) VALUES($1, $2, $3, $4, $5, $6) RETURNING *;', settings, function (err, res) {
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
    if(item !== null && item.city !== null && item.city.name !== null){
        // console.log('not null');
        return item
    }
     
} 

app.get('/api/', function (req, res) {
    axios.get('http://api.gios.gov.pl/pjp-api/rest/station/findAll')
    .then(function (response) {
    // handle success  
        let myResult = response.data.filter(isNotNull)

        let settings
        myResult.forEach(item => {
            //prepare chunk of data(array)
            settings = [
                item.id_station,
                item.stationName,
                item.gegrLat,
                item.gegrLon,
                item.city.name,
                item.addressStreet,
            ]

            //making n inserts 
            insertStation(settings, function(err, resData) {   
                if(err){
                    console.log('error: ', err)
                    // res.send("Internal Server Error").sendStatus(500)

                } else {
                    console.log("res's data:", res)
                    // res.sendStatus(200).send(resData)
                }
            })
        })
    })
    .catch(function (error) {
        // handle error
        console.log('error: ', error)
    })
})

app.get('/api/stations/', (req, res)=>{
    getAllStations(function(err, resData){
        if(err){
            console.log('error: ', err)            
            res.sendStatus(500).send("Internal Server Error")
        } else {
            console.log('res:', resData)
            res.sendStatus(200).send(resData).end()
        }
    })
})

app.delete('/api/cities/:id', function (req, res) {
    const id = req.params.id;
    deleteStation(id, function (err, resData) {
        if (err) {
            console.log(err)
            res.statusCode(500).send("Internal Server Error")
        } else {
            console.log('deleted: ', resData)
            res.sendStatus(200).send(resData).end()
        }
        res.end()
    })
})

app.post('/api/stations/', (req, res) => {

    const payload = JSON.stringify(req.body)
    
    console.log('my payload: ', payload)
    
    console.log('req headers: ', req.headers)
    
    const settings = [
        req.body.id_station,
        req.body.stationName,
        req.body.gegrLat,
        req.body.gegrLon,
        req.body.cityName,
        req.body.addressStreet
    ]        
    
    console.log('settings: ', settings);

    insertStation(settings, function(err, resData) {   
        if(err){
            console.log('error: ', err)
            res.send("Internal Server Error").sendStatus(500).end()
        } else {
            console.log("res's data: ", resData)
            res.sendStatus(200).end()
            //.send(resData)
        }
    })

})
            
            
