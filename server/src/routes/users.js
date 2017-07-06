import * as express from 'express'
import User from '../models/user'

export const router = express.Router()

router.get('/users', (req, res, next) => {
  User.find({}, 'username group createdAt updatedAt', (err, users) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(users)
  })
})

router.get('/users/:id', (req, res, next) => {
  var id = req.params.id
  User.findById(id, 'username group createdAt updatedAt', (err, user) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(user)
  })
})

router.put('/users/:id', (req, res, next) => {
  var id = req.params.id
  var user = req.body

  var update = {
    username: user.username,
    group: user.group
  }

  // new: true returns updated doc
  User.findOneAndUpdate({ _id: id }, update, { new: true }, (err, updatedUser) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(updatedUser)
  })
})

router.delete('/users/:id', (req, res, next) => {
  var id = req.params.id
  User.remove({ _id: id }, (err, user) => {
    if (err) {
      res.status(404).send('Not found')
      next()
    }
    res.json(user)
  })
})

// export default router
