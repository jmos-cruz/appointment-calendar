/**
 * This is the Data Access file. All methods used to
 * query the database are present here.
 * The database has one table, called 'appointments',
 * where all appointments are stored.
 * The table has a joint primary key with two entries:
 * the date of the appointment and the hour at which the meeting starts.
 * Since no two dates and hours can pratically overlap,
 * the same stays true for the database.
 * It accepts at least 1 employee and any number of clients
 */

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

/**
 * Obtains appointment by date and hour of start
 * @param {Date} date the date of the appointment
 * @param {string} startTime the hour that the appointment starts
 * @param {function} callback the callback function where the result of the query will be used
 */

let getAppointment = (date, startTime, callback) => {

    let sql = `SELECT * FROM ${table} WHERE date=? AND startTime=?`;
    let conditions = [date, startTime];

    connection.query(sql, conditions, (err, rslt, fields) => {
        if (err) console.log(err);
        return callback(rslt);
    })
}

/** 
 * Inserts data into the database
 * @param {Array} data an array with all the data coming from the user
 */

let addAppointment = (data) => {
    connection.query(`INSERT INTO ${table} VALUES (?)`, [data], (err, rslt) => {
        if (err) console.log(err);
    })
}

/**
 * Updates an appointment selected by the user
 * @param {Array} newAppointment 
 * @param {Array} oldAppointment 
 */

let updateAppointment = (newAppointment, oldAppointment) => {
    console.log(newAppointment, oldAppointment);
    connection.query(`UPDATE ${table} SET (?) WHERE date=? AND startTime=?`,
     [newAppointment, oldAppointment[0], oldAppointment[1]], 
     (err, rslt, fields) => {
        if (err) console.log(err);
    })
}

/**
 * Deletes an appointment selected by the user
 * @param {Array} appointment 
 */

let deleteAppointment = (appointment) => {
    connection.query(`DELETE FROM ${table} WHERE date = ? AND startTime = ?`,
    [appointment[0], appointment[1]],
    (err, rslt, fields) => {
        if (err) console.log(err);
    })
}

module.exports = {
    getAppointmentList, 
    getAppointmentsByMonth,
    getAppointmentsByEmployee,
    getAppointmentsByDate,
    getAppointment, 
    addAppointment,
    updateAppointment,
    deleteAppointment
};