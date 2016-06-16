"use strict";

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;  //
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
var compression = require('compression');

var api = require('./routes/api');
var authenticate = require('./routes/authenticate')(passport);

// middleware
app.use(compression());
app.use(logger('dev'));
app.use(session({
    secret: "everything is awesome!",
    resave: true,
    saveUninitialized: true
}));

var initPassport = require('./passport-init');
initPassport(passport);

app.use(express.static(__dirname + '/app'));  // development
//app.use(express.static(__dirname + '/dist'));  // production


app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

require('./database.js');

// security
app.disable('x-powered-by');

//app.use('/', index);
app.use('/auth', authenticate);
app.use('/api', api);

app.listen(port, function () {
    console.log('Server listening on port ' + port + "!");
});
