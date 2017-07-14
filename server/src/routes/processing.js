import express from 'express'
import path from 'path'
import Converter from '../converter'

var helpers = require('../helpers')

export const router = express.Router()

router.post('/preview', (req, res, next) => {
  if (!req.body.type || !req.body.userID || !req.body.markdown) {
    res.status(422).send({ error: 'Missing parameters: type, userID or markdown' })
    return next()
  }
  var type = req.body.type
  var userID = req.body.userID
  var markdown = req.body.markdown
  var converter = new Converter(type, markdown)
  converter.convert().then(() => {
    helpers.createPreview(converter, userID).then((filePath) => {
      var previewPath = path.join('preview', type, filePath)
      // res.status(200)
      res.json({
        message: 'success',
        previewPath: previewPath
      })
    }).catch(() => {
      res.status(500).send('error creating preview')
      return next()
    })
  })
  .catch(() => {
    res.status(500).send('something went wrong')
    return next()
  })
})

router.post('/export', function (req, res) {
  var userID = req.body.userID
  var markdown = req.body.markdown
  var type = req.body.type

  if (type === 'opMainzed') type = 'jahresbericht'
  var converter = new Converter(type, markdown)
  converter.convert().then(() => {
    helpers.createBundle(converter, userID).then(zipPath => {
      // console.log(zipPath)
      res.json({ zipPath: zipPath }) // Set disposition and send it.
    })
  })
  .catch(() => res.status(500).send('something went wrong'))
})
