//NOT NULL province name
const mStations = `
    CREATE TABLE IF NOT EXISTS stations(
        id bigint NOT NULL UNIQUE,
        station_name varchar(255),
        lattitude float8,
        longitude float8,
        province_name varchar(255) ,
        address varchar(255) ,
        city_name varchar(255) ,
        CONSTRAINT stations_pk PRIMARY KEY ("id")
    ) WITH (
    OIDS=FALSE
    );
`;

const mSensors = `
    CREATE TABLE IF NOT EXISTS sensors(
        id bigint,
        id_station bigint,
        parameter_name varchar(255),
        formula_name varchar(255),
        CONSTRAINT sensors_pk PRIMARY KEY ("id")
    ) WITH (
        OIDS=FALSE
    );
`;
const mAirQuality = `
    CREATE TABLE IF NOT EXISTS airquality(
        id_station bigint,
        date varchar(255),
        value varchar(255)
    ) WITH (
        OIDS=FALSE
    );
`;
        
const mData = `
    CREATE TABLE IF NOT EXISTS data(
        id bigint ,
        date varchar(255) ,
        value float8 ,
        CONSTRAINT data_pk PRIMARY KEY ("id")
        ) WITH (
            OIDS=FALSE
    );
`;
    
exports.mStations = mStations
exports.mSensors = mSensors
exports.mData = mData
exports.mAirQuality = mAirQuality 

// ALTER TABLE "sensors" ADD CONSTRAINT "sensors_fk0" FOREIGN KEY ("id_station") REFERENCES "stations"("id");

// ALTER TABLE "air-quality-index" ADD CONSTRAINT "air-quality-index_fk0" FOREIGN KEY ("id_station") REFERENCES "stations"("id");

// ALTER TABLE "data" ADD CONSTRAINT "data_fk0" FOREIGN KEY ("id") REFERENCES "sensors"("id");