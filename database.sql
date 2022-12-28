DROP TABLE IF EXISTS appointments;

CREATE TABLE appointments(
    date DATE NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    employee VARCHAR(50) NOT NULL,
    client VARCHAR(50),
    PRIMARY KEY(date, startTime)
);

