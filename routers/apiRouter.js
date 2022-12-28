const express = require('express');
const path = require('path');
const dao = require('../dao.js')
const router = express();

/**
 * Sends all apointments stored in the database
 */
router.get('/appointments', (req, res, next) => {
    dao.getAppointmentList((rslt) =>{
        res.send(rslt);
    });
})

/**
* This method obtains all appointments scheduled for a certain month of a year
* It will be mainly used to render a month when selected.
*/
router.get('/appointments/:year/:month', (req, res, next) => {
    dao.getAppointmentsByMonth(...Object.values(req.params), (rslt) => {
        res.send(rslt);
    });
})

module.exports = router;