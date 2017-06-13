var express = require('express')
var router = express.Router()
var path = require('path')

var Converter = require('../converter')
var helpers = require('../helpers')

router.post('/convert', function (req, res) {
  var type = req.query.type || 'jahresbericht'
  var markdown = req.body.markdown
  var converter = new Converter(type, markdown)
  converter.convert().then((html) => {
    res.status(200)
    res.send(html)
  })
  .catch(() => res.status(500).send('something went wrong'))
})

router.post('/preview', function (req, res) {
  if (!req.body.type || !req.body.user_id || !req.body.markdown) {
    res.status(422).send('missing parameters')
  }

  var type = req.body.type
  var userID = req.body.user_id
  var markdown = req.body.markdown

  var converter = new Converter(type, markdown)
  converter.convert().then(() => {
    helpers.createPreview(converter, userID).then((filePath) => {
      var previewPath = path.join('preview', type, filePath)
      res.status(200)
      res.json({
        message: 'success',
        previewPath: previewPath
      })
    })
  })
  .catch(() => res.status(500).send('something went wrong'))
})

router.post('/export', function (req, res) {
  var userID = req.query.user
  var markdown = req.body.markdown
  var type = req.body.type
  if (type === 'opMainzed') type = 'jahresbericht'
  var converter = new Converter(type, markdown)
  converter.convert().then(() => {
    helpers.createBundle(converter, userID).then(zipPath => {
      res.status(200)

      console.log(zipPath)
      res.download(zipPath) // Set disposition and send it.
    })
  })
  .catch(() => res.status(500).send('something went wrong'))
})

module.exports = router
