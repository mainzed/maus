"use strict";

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var logger = require('morgan');

// middleware
app.use(logger('dev'));
app.use(express.static(__dirname + '/app'));
app.use(express.static(__dirname));  // include bower_components
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// mongoose + mongoose schemas
var mongoose = require('mongoose');

//var db = 'mongodb://localhost/markdownstore';
var db = "mongodb://admin:root@ds011800.mlab.com:11800/heroku_ll09cx2q";

mongoose.connect(db, function(err) {
    if (err) {
        console.log("couldn't connect to mongodb!");
        console.log(err);
    } else {
        console.log("connected to mongodb successfull!");
    }
});

var File = require('./app/scripts/models/file');

// security
app.disable('x-powered-by');

/**
 * GET /tickets - Retrieves a list of tickets
 * GET /tickets/12 - Retrieves a specific ticket
 * POST /tickets - Creates a new ticket
 * PUT /tickets/12 - Updates ticket #12
 * DELETE /tickets/12 - Deletes ticket #12
 */

/*app.get('/', function (req, res) {
    res.send('use /api/players');
});*/

// players API
app.get('/api/v1/files', function (req, res) {
    File.getFiles(function(err, files) {
        if (err) {
            throw err;
        }
        res.json(files);
    });
});

app.get('/api/v1/files/:id', function (req, res) {
    var id = req.params.id;
    File.getFileById(id, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

app.post('/api/v1/files', function (req, res) {
    var file = req.body;
    File.addFile(file, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

app.put('/api/v1/files/:id', function (req, res) {
    var id = req.params.id;
    var file = req.body;
    File.updateFile(id, file, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

app.delete('/api/v1/files/:id', function (req, res) {
    var id = req.params.id;
    File.deleteFile(id, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

app.listen(port, function () {
    console.log('Server listening on port ' + port + "!");
});