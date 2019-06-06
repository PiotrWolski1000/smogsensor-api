CREATE TABLE "stations" (
	"id" bigint NOT NULL UNIQUE,
	"station-name" varchar(255) NOT NULL,
	"lattitude" float8 NOT NULL,
	"longitude" float8 NOT NULL,
	"province-name" varchar(255) NOT NULL,
	"address" varchar(255) NOT NULL,
	"city-name" varchar(255) NOT NULL,
	CONSTRAINT stations_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "sensors" (
	"id" bigint NOT NULL,
	"id_station" bigint NOT NULL,
	"parameter-name" varchar NOT NULL,
	"formula-name" varchar NOT NULL,
	CONSTRAINT sensors_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "air-quality-index" (
	"id_station" bigint NOT NULL,
	"date" DATE NOT NULL,
	"value" varchar NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "data" (
	"id" bigint NOT NULL,
	"date" DATE NOT NULL,
	"value" float8 NOT NULL,
	CONSTRAINT data_pk PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);




ALTER TABLE "sensors" ADD CONSTRAINT "sensors_fk0" FOREIGN KEY ("id_station") REFERENCES "stations"("id");

ALTER TABLE "air-quality-index" ADD CONSTRAINT "air-quality-index_fk0" FOREIGN KEY ("id_station") REFERENCES "stations"("id");

ALTER TABLE "data" ADD CONSTRAINT "data_fk0" FOREIGN KEY ("id") REFERENCES "sensors"("id");

