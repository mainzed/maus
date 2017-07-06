'use strict'

var express = require('express')
var router = express.Router()

// mongoose models
var ActiveFile = require('../models/activeFile')

// active files
router.get('/activefiles', function (req, res) {
  ActiveFile.find(function (err, activefiles) {
    if (err) {
      throw err
    }
    res.json(activefiles)
  })
})

router.get('/activefiles/:id', function (req, res) {
  var id = req.params.id
  ActiveFile.find({fileID: id}, function (err, activefiles) {
    if (err) {
      throw err
    }
    res.json(activefiles)
  })
})

router.post('/activefiles', function (req, res) {
  var file = req.body
  ActiveFile.create(file, function (err, activefile) {
    if (err) {
      throw err
    }
    res.json(activefile)
  })
})

router.put('/activefiles/:id', function (req, res) {
  var id = req.params.id
  var file = req.body

  ActiveFile.findOneAndUpdate({_id: id}, file, function (err, activefile) {
    if (err) {
      throw err
    }
    res.json(activefile)
  })
})

router.delete('/activefiles/:id', function (req, res) {
  var id = req.params.id
  ActiveFile.remove({_id: id}, function (err, activefile) {
    if (err) throw err
    res.json(activefile)
  })
})

module.exports = router
