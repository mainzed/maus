'use strict'

var express = require('express')
var router = express.Router()

var Definition = require('../models/definition')

router.get('/definitions', (req, res) => {
  Definition.find().sort('word').exec((err, definitions) => {
    if (err) throw err
    res.json(definitions)
  })
})

router.get('/definitions/:id', (req, res) => {
  var id = req.params.id
  Definition.findById(id, function (err, definition) {
    if (err) res.status(404).send('Not found')
    res.json(definition)
  })
})

router.post('/definitions', (req, res) => {
  var definition = req.body
  Definition.create(definition, (err, file) => {
    if (err) throw err
    res.json(file)
  })
})

router.put('/definitions/:id', (req, res) => {
  var id = req.params.id
  var definition = req.body

  var update = {
    word: definition.word,
    author: definition.author,
    text: definition.text,
    title: definition.title,
    license: definition.license,
    url: definition.url,
    filetype: definition.filetype
  }
  Definition.findOneAndUpdate({_id: id}, update, (err, definition) => {
    if (err) throw err
    res.json(definition)
  })
})

router.delete('/definitions/:id', (req, res) => {
  var id = req.params.id
  Definition.remove({_id: id}, (err, definition) => {
    if (err) throw err
    res.json(definition)
  })
})

module.exports = router
