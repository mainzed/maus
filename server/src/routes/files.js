import express from 'express'
export const router = express.Router()

// mongoose models
var File = require('../models/file')
var ArchivedFile = require('../models/archivedFile')

router.get('/files', (req, res, next) => {
  File.getFiles(function (err, files) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(files)
  })
})

router.get('/files/:id', function (req, res, next) {
  var id = req.params.id
  File.getFileById(id, function (err, file) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(file)
  })
})

router.post('/files', (req, res, next) => {
  if (!req.body.title || !req.body.markdown) {
    res.status(422).send('Missing fields')
    next()
  }
  // TODO: check if type string
  const file = new File({
    title: req.body.title,
    markdown: req.body.markdown
  })

  File.addFile(file, function (err, file) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(file)
  })
})

router.put('/files/:id', function (req, res, next) {
  var id = req.params.id
  var file = req.body

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
  }

  ArchivedFile.create(archivedFile, function (err) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
  })

  // update
  File.updateFile(id, file, function (err, file) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(file)
  })
})

router.delete('/files/:id', function (req, res, next) {
  var id = req.params.id
  File.deleteFile(id, function (err, file) {
    if (err) {
      res.status(404).send('Not found')
      next()
    }

    // remove archived files
    // TODO: test
    ArchivedFile.find({ _id: id }, (err, archivedFiles) => {
      if (err) {
        res.status(404).send('Not found')
        next()
      }
      archivedFiles.forEach((archivedFile) => {
        ArchivedFile.remove({ _id: archivedFile.fileID })
      })
    })

    res.json(file)
  })
})
