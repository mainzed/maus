import express from 'express'
export const router = express.Router()

// mongoose models
var File = require('../models/file')
var ArchivedFile = require('../models/archivedFile')

router.get('/files', (req, res) => {
  File.getFiles(function (err, files) {
    if (err) {
      throw err
    }
    res.json(files)
  })
})

router.get('/files/:id', function (req, res) {
  var id = req.params.id
  File.getFileById(id, function (err, file) {
    if (err) {
      throw err
    }
    res.json(file)
  })
})

router.post('/files', function (req, res) {
  var file = req.body
  File.addFile(file, function (err, file) {
    if (err) {
      throw err
    }
    res.json(file)
  })
})

router.put('/files/:id', function (req, res) {
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
    if (err) throw err
  })

  // update
  File.updateFile(id, file, function (err, file) {
    if (err) throw err
    res.json(file)
  })
})

router.delete('/files/:id', function (req, res) {
  var id = req.params.id
  File.deleteFile(id, function (err, file) {
    if (err) throw err

    // remove archived files
    // TODO: test
    ArchivedFile.find({ _id: id}, (err, archivedFiles) => {
      archivedFiles.forEach((archivedFile) => {
        ArchivedFile.remove({ _id: archivedFile.fileID })
      })
    })

    res.json(file)
  })
})
