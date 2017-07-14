import express from 'express'
import path from 'path'
import Converter from '../converter'

var helpers = require('../helpers')

export const router = express.Router()

router.post('/preview', function (req, res, next) {
  console.log('1...')
  if (!req.body.type || !req.body.userID || !req.body.markdown) {
    res.status(422).send('missing parameters')
    return next()
  }
  var type = req.body.type
  var userID = req.body.userID
  var markdown = req.body.markdown
  console.log('2...')
  var converter = new Converter(type, markdown)
  console.log('3...')
  converter.convert().then(() => {
    console.log('4...')
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
    console.log('5...')
    res.status(500).send('something went wrong')
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
