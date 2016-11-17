"use strict";

var path = require("path");
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
var compression = require('compression');
var cors = require('cors');
var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);

// middleware
app.use(cors());
app.use(compression());  // compress static content using gzip
app.use(logger('dev'));  // morgan
app.use(session({
    secret: "our little secret!",
    resave: true,
    saveUninitialized: true
}));

var initPassport = require('./passport-init');
initPassport(passport);

var oneDay = 86400000;
app.use('/preview_files',  express.static(__dirname + '/preview', { maxAge: oneDay }));
app.use(express.static(path.resolve(__dirname, '../dist')));

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require('./database.js');

// security
app.disable('x-powered-by');

// routes
app.use('/auth', authenticate);
app.use('/api', api);

// serve
app.listen(port, function () {
    console.log('Server listening on port ' + port + "!");
});
