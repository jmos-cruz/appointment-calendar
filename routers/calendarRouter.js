const express = require('express');
const path = require('path');
const dao = require('../dao.js')
const router = express();

router.get('*', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'views/index.html'));

});
    /*
    * This method obtains all appointments scheduled for a certain month of a year
    * It will be mainly used to render a month when selected.
    * Makes sense to add this method to a new API router that is only
    * responsible for sending info to the browser.
    * The browser will then access this info with fetch().
    */
    //dao.getAppointmentsByMonth('2022', '12');

router.get(['/images/duck.webp', '/favicon.ico'], (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'public/images/duck.webp'));
});

//Accepts JSON files
router.post('/', express.json({ type: '*/*' }), (req, res, next) => {
    dao.addAppointment(Object.values(req.body));
    res.sendStatus(200);
});

module.exports = router;