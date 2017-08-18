'use strict'

var Exporter = require('../exporter')
var express = require('express')
var router = express.Router()
var fs = require('fs')
var path = require('path')
var Zip = require('node-zip')

// mongoose models
var File = require('../models/file');
var Definition = require('../models/definition');
var ArchivedFile = require('../models/archivedFile');
var ActiveFile = require('../models/activeFile');
var User = require('../models/user');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {

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
  User.find(function (err, users) {
    if (err) {
      throw err
    }
    var result = users.map(function (user) {
      var obj = {}
      obj._id = user._id
      obj.username = user.username
      obj.group = user.group
      obj.createdAt = user.createdAt
      obj.updatedAt = user.updatedAt
      return obj
    })
    res.json(result)
  })
})

router.get('/users/:id', function (req, res) {
  var id = req.params.id
  User.findById(id, function (err, user) {
    if (err) {
      res.status(404).send('Not found')
    }

    // filter result
    var result = {}
    result._id = user._id
    result.username = user.username
    result.group = user.group
    result.createdAt = user.createdAt
    result.updatedAt = user.updatedAt

    res.json(result)
  })
})

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

     var update = {
         username: user.username,
         group: user.group
     };
     User.findOneAndUpdate({_id: id}, update, function(err, user) {
         if (err) {
             throw err;
         }
         res.json(user);
     });
 });

 router.delete('/users/:id', function (req, res) {
     //console.log("trying to delete user!");
     var id = req.params.id;

     User.remove({_id: id}, function(err, user) {
         if (err) {
             throw err;
         }
         res.json(user);
     });

 });

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
        title: definition.title,
        license: definition.license,
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

router.delete('/archivedfiles/:id', function (req, res) {
    var id = req.params.id;
    ArchivedFile.remove({_id: id}, function(err, archivedFile) {
        if (err) {
            throw err;
        }
        res.json(archivedFile);
    });
});

// active files
router.get('/activefiles', function (req, res) {
    ActiveFile.find(function(err, activefiles) {
        if (err) {
            throw err;
        }
        res.json(activefiles);
    });
});

router.get('/activefiles/:id', function (req, res) {
    var id = req.params.id;
    ActiveFile.find({fileID: id}, function(err, activefiles) {
        if (err) {
            throw err;
        }
        res.json(activefiles);
    });
});

router.post('/activefiles', function (req, res) {
    var file = req.body;
    ActiveFile.create(file, function(err, activefile) {
        if (err) {
            throw err;
        }
        res.json(activefile);
    });
});


router.put('/activefiles/:id', function (req, res) {
    var id = req.params.id;
    var file = req.body;

    ActiveFile.findOneAndUpdate({_id: id}, file, function(err, activefile) {
        if (err) {
            throw err;
        }
        res.json(activefile);
    });
});

router.delete('/activefiles/:id', function (req, res) {
    var id = req.params.id;
    ActiveFile.remove({_id: id}, function(err, activefile) {
        if (err) {
            throw err;
        }
        res.json(activefile);
    });
});

// post html string and save it as preview.html
router.post('/preview', function (req, res) {
    function isValidType(type) {
        return type === "opOlat" || type === "opMainzed" || type === "prMainzed";
    }
    var html = req.body.html;
    var type = req.body.type;
    var userID = req.body.user_id;

    if (!isValidType(type)) {
        res.status(500).send('Filetype ' + type + 'not supported!');
    }

    var filename = "/preview_" + userID + ".html";
    var outputPath = path.join(__dirname, "../preview/", type.toLowerCase(), filename);

    fs.writeFile(outputPath, html, { flag : 'w' }, function(err) {
        if (err) {
            res.status(500).send('Error while trying to save preview!');
        } else {
            res.status(200);
            res.json({
                message: "success",
                previewPath: path.join("preview", type.toLowerCase(), filename)
            });
        }
    });
});

router.get('/templates/opmainzed', function (req, res) {
    var filePath = path.join(__dirname, "../templates/opMainzed.html");
    fs.access(filePath, function(err) {
        if (err) {
            if (err.code === "ENOENT") {
              res.status(500).send('Files does not exist!');
              return;
            } else {
              throw err;
            }
        }
        res.status(200);
        res.sendFile(filePath);
    });
});

router.get('/download/:id', function (req, res) {
  var id = req.params.id;

  // get markdown
  File.findById(id, function(err, file) {
    if (err) {
      res.status(500).send('File does not exist!');
      return
    }

    resolveIncludes(file.markdown).then(markdown => {
      // console.log(markdown)
      let content = markdown
      Definition.find({ filetype: 'opMainzed' }, (err, defs) => {

        var definitions = defs.filter((def) => def.category === 'definition')
        var pictures = defs.filter((def) => def.category === 'picture')
        var citations = defs.filter((def) => def.category === 'citation')

        var exporter = new Exporter()
        var mapping = exporter.getMapping(content)

        var markdown = exporter.resolveMapping(content, mapping, citations, pictures)
        var footnotes = exporter.getFootnotes(mapping, definitions, pictures)
        // var tableOfFigures = exporter.getFigures()

        var zip = new Zip;
        zip.file('content.md', markdown)
        zip.file('endnotes.md', footnotes)
        var options = { base64: false, compression: 'DEFLATE' }
        const filename = path.join(__dirname, '../preview/export.zip')
        fs.writeFile(filename, zip.generate(options), 'binary', (err) => {
          if (err) console.log(err)
          res.set('Content-Type', 'application/zip')
          res.set('Content-Disposition', 'attachment; filename=export.zip')
          res.sendFile(filename)
        })
      })
    })

  })
})

// function bundle(main, footnotes) {
//   var zip = new Zip;
//   zip.file('hello.txt', 'Hello, World!')
//   var options = { base64: false, compression: 'DEFLATE' }
//   fs.writeFile(__dirname + '/export.zip', zip.generate(options), 'binary', function (error) {
//     console.log('wrote test1.zip', error)
//   });
// }

// resolves includes if any exist
function resolveIncludes(markdown) {
  return new Promise((resolve, reject) => {
    let result = markdown

    // process includes
    var includes = markdown.match(/include\((.*)\)/g);

    // if includes, get all files (select later)
    if (includes) {
      File.find({}, (err, files) => {
        if (err) reject(err)
        includes.forEach(include => {
          let filename = include.replace('include(', '').replace(')', '')
          const file = files.find(f => f.title.toLowerCase().trim() === filename.toLowerCase().trim())
          result = markdown.replace(include, file.markdown)
        })
        resolve(result)
      })
    } else {
        resolve(result)
    }
  })
}
module.exports = router
