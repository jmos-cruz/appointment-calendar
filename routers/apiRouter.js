const express = require('express');
const path = require('path');
const dao = require('../dao.js')
const router = express();

router.get('/appointments', (req, res, next) => {
    dao.getAppointmentList((rslt) =>{
        res.send(rslt);
    });
})

router.get('/appointments/:year/:month', (req, res, next) => {
    dao.getAppointmentsByMonth(...Object.values(req.params), (rslt) => {
        res.send(rslt);
    });
})

module.exports = router;