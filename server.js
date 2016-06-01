"use strict";

var express = require('express');
var app = express();
var port = process.env.PORT || 3000; // changes1
var logger = require('morgan');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose');
var compression = require('compression');
var apiRouter = require('./routes/api');

// middleware
app.use(compression());
app.use(logger('dev'));

app.use(express.static(__dirname + '/app'));  // development
//app.use(express.static(__dirname + '/dist'));  // production


app.use(bodyParser.json());

require('./database.js');

// security
app.disable('x-powered-by');

app.use('/api', apiRouter);

app.listen(port, function () {
    console.log('Server listening on port ' + port + "!");
});
