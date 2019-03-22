const axios = require('axios')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const pg = require('pg');
const Pool = pg.Pool;

const schedule = require('node-schedule');

let startTime = new Date(Date.now() + 5000);
let endTime = new Date(startTime.getTime() + 5000);

// var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '1 * * * *' }, function(){
    var j = schedule.scheduleJob('1 * * * *', function(){
    //let the magic begin
    console.log('start time: ', startTime);
    console.log('it works!');
});



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

// id SERIAL PRIMARY KEY,
const createTableStations = `
    CREATE TABLE IF NOT EXISTS stations(
        id_station integer PRIMARY KEY UNIQUE,
        stationName VARCHAR(255) NOT NULL,
        gegrLat VARCHAR(255) NOT NULL,
        gegrLon VARCHAR(255) NOT NULL,
        cityName VARCHAR(255) NOT NULL,
        provinceName VARCHAR(255),
        addressStreet VARCHAR(255)
    );        
`

const createTableSensors = `
    CREATE TABLE IF NOT EXISTS sensors( 
        id int NOT NULL,
        id_station bigint NOT NULL,
        parameter_name varchar(255) NOT NULL,
        formula_name varchar(255) NOT NULL,
        CONSTRAINT sensors_pk PRIMARY KEY ("id")
    )
`

const CreateTableAirQuality = `
        CREATE TABLE IF NOT EXISTS airquality(
            id_station int NOT NULL,
            date DATE NOT NULL,
            value varchar NOT NULL
        )
`

const CreateTableData = `
    CREATE TABLE IF NOT EXISTS data(
        id int NOT NULL,
        date date NOT NULL,
        value float8 NOT NULL,
        CONSTRAINT data_pk PRIMARY KEY ("id")
    )
`


pool.query(createTableStations, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        // console.log(res);
    }
});

pool.query(createTableSensors, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        // console.log(res);
    }
});

pool.query(CreateTableAirQuality, function (err, res) {
    if (err) {
        console.error(err);
    } else {
        // console.log(res);
    }
});

pool.query(CreateTableData, function (err, res) {
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
    pool.query('INSERT INTO stations(id_station,stationName,gegrLat,gegrLon,cityName,provinceName,addressStreet) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;', settings, function (err, res) {
        if (err) {
            callback(err, null)
        } else {
            callback(null, res.rows[0])
        }
    });
}
function insertAirQuality(settings, callback) {
    console.log('inserting these params into air-quality table: ', settings)
    pool.query('INSERT INTO airquality(id_station,date,value) VALUES($1, $2, $3) RETURNING *;', settings, function (err, res) {
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

app.get('/api/', function (req, res) {
    console.log('entered api, db will updates soon')

    axios.get('http://api.gios.gov.pl/pjp-api/rest/station/findAll')
    .then(function (response) {
    // handle success  
        let myResult = response.data.filter(isNotNull)

        // console.log('result[0]: ', myResult[0])
        // console.log('my id is: ', myResult[0].id_station)
        let settings
        myResult.forEach(item => {
            //prepare chunk of data(array)
            settings = [
                item.id,
                item.stationName,
                item.gegrLat,
                item.gegrLon,
                item.city.name,
                item.city.commune.provinceName,
                item.addressStreet,
            ]

            //making n inserts of 
            insertStation(settings, function(err, resData) {   
                if(err){
                    console.log('error: ', err)
                } else {
                    console.log("res's data:", res)
                    // res.sendStatus(200).send(resData)
                    // res.send(resData)
                }
            })

            //should I here make another get response for each station?
            axios.get(`http://api.gios.gov.pl/pjp-api/rest/aqindex/getIndex/${item.id}`)
            .then((response2)=>{
            //success get request
                // console.log('air quality index data for item id: ', item.id)
                // console.log('res', response2.data)

                let settings = [
                    item.id,
                    response2.data.stCalcDate,
                    response2.data.stIndexLevel.indexLevelName
                ]

        

                //filling air index quality table
                insertAirQuality(settings, function(err, resData) {   
                    if(err){
                        console.log('error: ', err)
                    } else {
                        console.log("res's data:", resData)
                        // res.sendStatus(200).send(resData)
                        // res.send(resData)
                    }
                })
            })
            .catch(err=>{
                console.log('error: ', err)
            })


        })//finish station for each loop

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

    // const payload = JSON.stringify(req.body)
    // console.log('my payload: ', payload)
    // console.log('req headers: ', req.headers)
    
    const settings = [
        req.body.id_station,
        req.body.stationName,
        req.body.gegrLat,
        req.body.gegrLon,
        req.body.cityName,
        req.body.provinceName,
        req.body.addressStreet
    ]        
    
    console.log('settings: ', settings);

    insertStation(settings, function(err, resData) {   
        if(err){
            console.log('error: ', err)
        } else {
            console.log("res's data: ", resData)
            res.sendStatus(200).send(resData)
        }
    })
    res.end()
})
            
            
