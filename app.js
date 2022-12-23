const express = require('express');
const path = require('path')
const logger = require('morgan');
const helmet = require('helmet');

const calendarRouter = require('./routers/calendarRouter.js');
const apiRouter = require('./routers/apiRouter.js')

const app = express();

app.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      "block-all-mixed-content": true,
      "upgrade-insecure-requests": true,
      directives: {
        "default-src": [
            "'self'"
        ],
        "base-uri": "'self'",
        "font-src": [
            "'self'",
            "https:",
            "data:"
        ],
        "frame-ancestors": [
            "'self'"
        ],
        "img-src": [
            "'self'",
            "data:"
        ],
        "object-src": [
            "'none'"
        ],
        "script-src": [
            "'self'",
            "https://code.jquery.com"
        ],
        "script-src-attr": "'none'",
        "style-src": [
            "'self'",
            "https://cdn.jsdelivr.net"
        ],
      },
    }),
    helmet.dnsPrefetchControl({
        allow: true
    }),
    helmet.frameguard({
        action: "deny"
    }),
    helmet.hidePoweredBy(),
    helmet.hsts({
        maxAge: 123456,
        includeSubDomains: false
    }),
    helmet.ieNoOpen(),
    helmet.noSniff(),
    helmet.referrerPolicy({
        policy: [ "origin", "unsafe-url" ]
    }),
    helmet.xssFilter()
);

app.use(logger('dev')); //Writes in terminal all requests made to the server
app.use(express.urlencoded({extended: false})); //decodes body of POST requests in x-www-form-urlenconded
app.use(express.static(path.join(__dirname, 'public'))); //automatically searches the given dir when files are requested

app.use('/api', apiRouter); //Redirects API requests
app.use('*', calendarRouter); //Redirects all requests


module.exports = app;