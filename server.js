"use strict";

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var compression = require('compression');

// middleware
app.use(compression());
app.use(logger('dev'));
app.use(express.static(__dirname + '/app'));

//app.use(express.static(__dirname));  // include bower_components
app.use(bodyParser.json());

require('./database.js');

var File = require('./models/file');
var Definition = require('./models/definition');

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

// definitions
app.get('/api/v1/definitions', function (req, res) {
    
    Definition.find().sort('word').exec(function(err, definitions) {
        if (err) {
            throw err;
        }
        res.json(definitions);
    });

});

app.get('/api/v1/definitions/:id', function (req, res) {
    var id = req.params.id;
    Definition.findById(id, function(err, definition) {
        if (err) {
            res.status(404).send('Not found');
        }
        res.json(definition);
    });
});

app.post('/api/v1/definitions', function (req, res) {
    var definition = req.body;
    Definition.create(definition, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

app.put('/api/v1/definitions/:id', function (req, res) {
    var id = req.params.id;
    var definition = req.body;   

    var update = {
        word: definition.word,
        author: definition.author,
        text: definition.text,
        url: definition.url
    };
    Definition.findOneAndUpdate({_id: id}, update, function(err, definition) {
        if (err) {
            throw err;
        }
        res.json(definition);
    });
});

app.delete('/api/v1/definitions/:id', function (req, res) {
    var id = req.params.id;

    Definition.remove({_id: id}, function(err, definition) {
        if (err) {
            throw err;
        }
        res.json(definition);
    });

});

app.listen(port, function () {
    console.log('Server listening on port ' + port + "!");
    
});