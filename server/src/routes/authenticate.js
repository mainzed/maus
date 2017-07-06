import express from 'express'

const router = express.Router()

module.exports = passport => {
  router.post('/login', passport.authenticate('login', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
  }))

  router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/auth/success',
    failureRedirect: '/auth/failure'
  }))

  router.get('/signout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  // sends successful login state back to angular
  router.get('/success', (req, res) => {
    res.send({ state: 'success', user: req.user ? req.user : null })
  })

  // sends failure login state back to angular
  router.get('/failure', (req, res) => {
    res.send({ state: 'failure', user: null, message: 'Invalid username or password' })
  })

  return router
}
