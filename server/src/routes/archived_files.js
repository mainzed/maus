import express from 'express'
export const router = express.Router()

// mongoose models
var ArchivedFile = require('../models/archivedFile')

// archived files
router.get('/archivedfiles', function (req, res) {
  ArchivedFile.find(function (err, archivedFiles) {
    if (err) throw err
    res.json(archivedFiles)
  })
})

router.get('/archivedfiles/:id', function (req, res) {
  var id = req.params.id
  ArchivedFile.find({fileID: id}, function (err, archivedFiles) {
    if (err) throw err
    res.json(archivedFiles)
  })
})

router.delete('/archivedfiles/:id', function (req, res) {
  var id = req.params.id
  ArchivedFile.remove({_id: id}, function (err, archivedFile) {
    if (err) throw err
    res.json(archivedFile)
  })
})
