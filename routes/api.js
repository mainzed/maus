'use strict';

var express = require('express');
var router = express.Router();

// mongoose models
var File = require('../models/file');
var Definition = require('../models/definition');
var ArchivedFile = require('../models/archivedFile');

/**
 * GET /tickets - Retrieves a list of tickets
 * GET /tickets/12 - Retrieves a specific ticket
 * POST /tickets - Creates a new ticket
 * PUT /tickets/12 - Updates ticket #12
 * DELETE /tickets/12 - Deletes ticket #12
 */

router.get('/files', function (req, res) {
    File.getFiles(function(err, files) {
        if (err) {
            throw err;
        }
        res.json(files);
    });
});

router.get('/files/:id', function (req, res) {
    var id = req.params.id;
    File.getFileById(id, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

router.post('/files', function (req, res) {
    var file = req.body;
    File.addFile(file, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

router.put('/files/:id', function (req, res) {
    var id = req.params.id;
    var file = req.body;

    // archive before update
    // archive file
    var archivedFile = {
        fileID: id,
        author: file.author,
        title: file.title,
        markdown: file.markdown,
        type: file.type,
        private: file.private,
        updated_by: file.updated_by
    };

    ArchivedFile.create(archivedFile, function(err) {
        if (err) {
            throw err;
        }
        //console.log("archived file!");
    });

    // update
    File.updateFile(id, file, function(err, file) {
        if (err) {
            throw err;
        }

        res.json(file);
    });
});

router.delete('/files/:id', function (req, res) {
    var id = req.params.id;
    File.deleteFile(id, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

// definitions
router.get('/definitions', function (req, res) {
    
    Definition.find().sort('word').exec(function(err, definitions) {
        if (err) {
            throw err;
        }
        res.json(definitions);
    });

});

router.get('/definitions/:id', function (req, res) {
    var id = req.params.id;
    Definition.findById(id, function(err, definition) {
        if (err) {
            res.status(404).send('Not found');
        }
        res.json(definition);
    });
});

router.post('/definitions', function (req, res) {
    var definition = req.body;
    Definition.create(definition, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});

router.put('/definitions/:id', function (req, res) {
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

router.delete('/definitions/:id', function (req, res) {
    var id = req.params.id;

    Definition.remove({_id: id}, function(err, definition) {
        if (err) {
            throw err;
        }
        res.json(definition);
    });

});

// archived files
router.get('/archivedfiles', function (req, res) {
    ArchivedFile.find(function(err, archivedFiles) {
        if (err) {
            throw err;
        }
        res.json(archivedFiles);
    });
});

router.get('/archivedfiles/:id', function (req, res) {
    var id = req.params.id;
    ArchivedFile.find({fileID: id}, function(err, archivedFiles) {
        if (err) {
            throw err;
        }
        res.json(archivedFiles);
    });
});

/*router.post('/archivedfiles', function (req, res) {
    var file = req.body;
    File.addFile(file, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});*/

/*router.put('/files/:id', function (req, res) {
    var id = req.params.id;
    var file = req.body;
    File.updateFile(id, file, function(err, file) {
        if (err) {
            throw err;
        }
        res.json(file);
    });
});*/

router.delete('/archivedfiles/:id', function (req, res) {
    var id = req.params.id;
    ArchivedFile.remove({_id: id}, function(err, archivedFile) {
        if (err) {
            throw err;
        }
        res.json(archivedFile);
    });
});

module.exports = router;
