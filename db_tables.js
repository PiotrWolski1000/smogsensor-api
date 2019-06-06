
const pool = new Pool({
    user: 'postgres',
    host: 'postgres.localhost',
    database: 'postgres',
    password: 'mysecretpassword',
    port: 5432,
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
        id SERIAL PRIMARY KEY,
        id_station int NOT NULL,
        parameter_name varchar(255) NOT NULL,
        formula_name varchar(255) NOT NULL
    )
`
        // CONSTRAINT sensors_pk PRIMARY KEY ("id")

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

