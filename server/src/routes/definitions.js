import express from 'express'
import Definition from '../models/definition'

export const router = express.Router()

router.get('/definitions', (req, res, next) => {
  Definition.find().sort('word').exec((err, definitions) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(definitions)
  })
})

router.get('/definitions/:id', (req, res, next) => {
  var id = req.params.id
  Definition.findById(id, (err, definition) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(definition)
  })
})

router.post('/definitions', (req, res, next) => {
  var definition = req.body
  Definition.create(definition, (err, file) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(file)
  })
})

router.put('/definitions/:id', (req, res, next) => {
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

  Definition.findOneAndUpdate({ _id: id }, update, { new: true }, (err, definition) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(definition)
  })
})

router.delete('/definitions/:id', (req, res, next) => {
  var id = req.params.id
  Definition.remove({ _id: id }, (err, definition) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(definition)
  })
})
