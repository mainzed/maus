'use strict';

var express = require('express');
var router = express.Router();
var fs = require('fs');  // write files
var path = require('path');

// mongoose models
var File = require('../models/file');
var Definition = require('../models/definition');
var ArchivedFile = require('../models/archivedFile');
var User = require('../models/user');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
    console.log("checking!");
	// if user is authenticated in the session, call the next() to call the next request handler
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	return res.redirect('/whatever');
}

/**
 * GET /tickets - Retrieves a list of tickets
 * GET /tickets/12 - Retrieves a specific ticket
 * POST /tickets - Creates a new ticket
 * PUT /tickets/12 - Updates ticket #12
 * DELETE /tickets/12 - Deletes ticket #12
 */
 router.get('/users', function (req, res) {
     User.find(function(err, users) {
         if (err) {
             throw err;
         }
         res.json(users);
     });
 });

 router.get('/users/:id', function (req, res) {
     var id = req.params.id;
     User.findById(id, function(err, user) {
         if (err) {
             res.status(404).send('Not found');
         }
         res.json(user);
     });
 });

 router.post('/users', function (req, res) {
     var user = req.body;
     User.create(user, function(err, user) {
         if (err) {
             throw err;
         }
         res.json(user);
     });
 });

 router.put('/users/:id', function (req, res) {
     var id = req.params.id;
     var user = req.body;

     /*var update = {
         word: definition.word,
         author: definition.author,
         text: definition.text,
         url: definition.url,
         filetype: definition.filetype
     };*/
     User.findOneAndUpdate({_id: id}, user, function(err, user) {
         if (err) {
             throw err;
         }
         res.json(user);
     });
 });

 router.delete('/users/:id', function (req, res) {
     var id = req.params.id;

     User.remove({_id: id}, function(err, user) {
         if (err) {
             throw err;
         }
         res.json(user);
     });

 });

//Register the authentication middleware
// intercepts requests to /files when not authenticated
router.use('/api/files', isAuthenticated);

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
        url: definition.url,
        filetype: definition.filetype
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

// post html string and save it as preview.html
router.post('/savepreview', function (req, res) {

    var html = req.body.html;
    var type = req.body.type;
    var userID = req.body.user_id;
    var outputPath;

    if (type === "opOlat" || type === "opMainzed" || type === "prMainzed") {
        outputPath = "app/preview_files/" + type.toLowerCase() + "/preview_" + userID + ".html";
    } else {
        res.status(500).send('Filetype ' + type + 'not supported!');
    }

    //var finalPath =  path.join(__dirname, outputPath);

    //console.log(finalPath);

    var options = { flag : 'w' };
    fs.writeFile(outputPath , html, options, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error while trying to save preview!');
        } else {
            //console.log("created " + outputPath);
            res.status(200);
            res.json({
                message: "success",
                previewPath: outputPath.substring(4)
            });
        }

    });
});

module.exports = router;
