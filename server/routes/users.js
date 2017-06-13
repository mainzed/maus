'use strict'

var express = require('express')
var router = express.Router()

// mongoose models
var User = require('../models/user')

router.get('/users', function (req, res) {
  User.find({}, 'username group createdAt updatedAt', function (err, users) {
    if (err) {
      throw err
    }
    res.json(users)
  })
})

router.get('/users/:id', function (req, res) {
  var id = req.params.id
  User.findById(id, 'username group createdAt updatedAt', function (err, user) {
    if (err) {
      res.status(404).send('Not found')
    }
    res.json(user)
  })
})

router.post('/users', function (req, res) {
  var user = req.body
  User.create(user, function (err, user) {
    if (err) throw err
    res.json(user)
  })
})

router.put('/users/:id', function (req, res) {
  var id = req.params.id
  var user = req.body

  var update = {
    username: user.username,
    group: user.group
  }
  User.findOneAndUpdate({_id: id}, update, function (err, user) {
    if (err) throw err
    res.json(user)
  })
})

router.delete('/users/:id', function (req, res) {
  var id = req.params.id

  User.remove({_id: id}, function (err, user) {
    if (err) {
      throw err
    }
    res.json(user)
  })
})

module.exports = router
