const axios = require('axios')
const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const db = require('./db/pgpool')
var pool = db.getPool()//connection with db
var schedule = require('node-schedule');

var j = schedule.scheduleJob('1 * * * *', function(){//run every hour when minute = 1
    console.log('The answer to life, the universe, and everything!');
});

//my functions to manipulate our database
let mStations = require('./db_functions/stations/') 
let mSensors = require('./db_functions/sensors/') 
let mData = require('./db_functions/data/') 
let mAirQuality = require('./db_functions/airquality/') 
let destroyDb = require('./db_functions/all_tables/index')
var router = express.Router()//server routes

//setting up the  server
let port = 3000;

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


app.get('/', function (req, res) {
    res.send('SmogSensor API')
})

app.listen(port, function () {
    console.log('Server started, navigate to: ', port)
})

//myRoutes
app.get('/api/', function (req, res) {
    console.log('entered api, db will updates soon')

    axios.get('http://api.gios.gov.pl/pjp-api/rest/station/findAll')
    .then(function (response) {
    // handle success  
        let myResult = response.data.filter(mStations.isNotNull)
        // console.log('updates, here the data: ', myResult)
        // console.log('result[0]: ', myResult[0])
        // console.log('my id is: ', myResult[0].id_station)
        let settings
        myResult.forEach(item => {
            settings = [
                item.id,
                item.stationName,
                item.gegrLat,
                item.gegrLon,
                item.city.commune.provinceName,
                item.addressStreet,
                item.city.name,
            ]
            //making n inserts of stations
            mStations.insertStation(settings, function(err, resData) {   
                if(err){
                    //console.log('error: ', err)
                } else {
                    //console.log("res's data:", res)
                    //res.sendStatus(200).send(resData)
                }
            })
            //airquality api call
            axios.get(`http://api.gios.gov.pl/pjp-api/rest/aqindex/getIndex/${item.id}`)
            .then((response2)=>{
                //success get request

                let name = response2.data.stIndexLevel?response2.data.stIndexLevel.indexLevelName:null
                let settings2 = [
                    item.id,
                    response2.data.stCalcDate,
                    name
                ]
                //filling air index quality indexLevelNametable
                mAirQuality.insertAirQuality(settings2, function(err, resData) {   
                    if(err){
                        // console.log('error: ', err)
                    } else {
                        // console.log("res's data:", resData)
                        // res.sendStatus(200).send(resData)
                    }
                })
            }).catch(err=>{
                console.log('error: ', err)
            })//end of inserting airquality

            //sending request to gios api (sensors)
            axios.get(`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${item.id}`)
            .then((response3)=>{
                //success get request
                response3.data.forEach((sensor_item) => {
                    let settings = [
                        sensor_item.id,
                        item.id,//station id
                        sensor_item.param.paramName,
                        sensor_item.param.paramCode
                    ]
                    //filling sensors table
                    mSensors.insertSensor(settings, function(err, resData){
                        if(err){
                            // console.log('error: ', err)
                        } else {
                            // console.log(resData)
                            // res.sendStatus(200).send(resData)
                            //api call for data from specific sensor
                            axios.get(`http://api.gios.gov.pl/pjp-api/rest/data/getData/${sensor_item.id}`)
                            .then((response4)=>{

                                // console.log(response4.data.values[0])
                                let settings = [
                                    sensor_item.id,
                                    response4.data.values[response4.data.values.length - 1].date,
                                    response4.data.values[response4.data.values.length - 1].value
                                ]

                                // console.log(typeof(response4.data.values[0].date))
                                // console.log(settings)

                                mData.insertData(settings, function(err, resData4){
                                    if(err){
                                        console.log('err4: ', err)
                                    } else {
                                        console.log('res4: ', resData4);
                                    }
                                })

                            }).catch((err)=>{
                                console.log('err4: ', err)
                            })
                        }
                    })      
                })
            }).catch(err=>{
                // console.log('error: ', err)
            })//end of inserting to sensors table

        })//finish for each station loop
        //res send to stations?
    })
    .catch(function (error) {
        // handle error
        // console.log('error: ', error)
    })
    //should I here make another get response for each station?
    // res.sendStatus(200)//.send(res)
})

app.get('/api/stations/', (req, res)=>{
    mStations.getAllStations(function(err, resData){
        if(err){
            console.log('error: ', err)            
            res.sendStatus(500).send("Internal Server Error")
        } else {
            console.log('res:', resData)
            res.sendStatus(200).send(resData).end()
        }
    })
})

app.post('/api/stations/', (req, res) => { 
    console.log(req.body)

    const settings = [
        req.body.id,
        req.body.station_name,
        req.body.lattitude,
        req.body.longitude,
        req.body.province_name,
        req.body.address,
        req.body.city_name,
    ]        
    // console.log('settings: ', settings);
    mStations.insertStation(settings, function(err, resData) {   
        if(err){
            console.log('error: ', err)
        } else {
            // console.log("res's data: ", resData)
            res.sendStatus(200).send(resData)
        }
    })
    res.end()
})

app.delete('/api/cities/:id', function (req, res) {
    const id = req.params.id;
    mStations.deleteStation(id, function (err, resData) {
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

app.get('/api/getSensor/:id', function(req, res) {//new, works, unblock console.logs
    // console.log('getSensor invoked!');
    const id = req.params.id;
    // console.log('param id: ', id);
    axios.get(`http://api.gios.gov.pl/pjp-api/rest/station/sensors/${id}`).then((res)=>{
        // console.log('res sensor get with param: ', res.data);
    }).catch((err)=>{console.log('err: '. err)})
})


//DANGEROUS !!!
app.get('/api/destroyAll', function(req, res) {//destroys all tables in db
    destroyDb.deleteTableStations((err, res)=>{
        if(err){
            console.log('err: ', err)
        } else {
            // console.log('res: ', res)

            destroyDb.deleteTableSensors(function(err, res){
                if(err){
                    console.log('err: ', err)
                } else {
                    // console.log('res: ', res)
                    destroyDb.deleteTableAirQuality(function(err, res){
                        if(err){
                            console.log('err: ', err)
                        } else {
                            // console.log('res: ', res)
                            destroyDb.deleteTableData(function(err, res){
                                if(err){
                                    console.log('err: ', err)
                                } else {
                                    // console.log('res: ', res)
                                }
                            })
                        }
                    })
                }
            })
        }
    })
    // res.sendStatus(200)
})