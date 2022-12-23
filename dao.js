const mysql = require('mysql');
const fs = require('fs');

const connection = mysql.createConnection({
    multipleStatements: true,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'meeting_room'
})

const table = 'appointments';

connection.connect((err) => {
    if (err) throw err;

    console.log('Connected to database');
})

const tableInit = fs.readFileSync(`${__dirname}/database.sql`).toString();
connection.query(tableInit, (err, result) => {
    if (err) console.log(err);
    console.log('Table successfully created');
})

let getAppointmentList = (callback) => {
    connection.query(`SELECT * FROM ${table}`, (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    })
}

//Selects all appointments made for the year and month specified
let getAppointmentsByMonth = (year, month, callback) => {
    connection.query(`SELECT * FROM ${table} WHERE YEAR(date)=? AND MONTH(date)=?`, [year, month], (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    });
}

let getAppointmentsByDate = (date, callback) => {
    connection.query(`SELECT * FROM ${table} WHERE date=?`, date, (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    })
}

let getAppointmentsByEmployee = (employee, callback) => {
    connection.query(`SELECT * FROM ${table} WHERE employee=?`, employee, (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    })
}

//Obtains appointment by date, start time and employee
let getAppointment = (date, startTime, employee, callback) => {

    let sql = `SELECT * FROM ${table} WHERE date=? AND startTime=? AND employee=?`;
    let conditions = [date, startTime, employee];

    connection.query(sql, conditions, (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    })
}

//Inserts into database
let addAppointment = (data) => {
    connection.query(`INSERT INTO ${table} VALUES (?)`, [data], (err, rslt) => {
        if (err) console.log(err);
    })
}

module.exports = {
    getAppointmentList, 
    getAppointmentsByMonth,
    getAppointmentsByEmployee,
    getAppointmentsByDate,
    getAppointment, 
    addAppointment
};