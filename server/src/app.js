// import fs from 'fs'
import mongoose from 'mongoose'
import express from 'express'
import fs from 'fs'
var path = require('path')

var app = express()
var logger = require('morgan')
var passport = require('passport')
var session = require('express-session')
var bodyParser = require('body-parser')
var compression = require('compression')
var cors = require('cors')
var authenticate = require('./routes/authenticate')(passport)

import { router as userRoutes } from './routes/users'
import { router as fileRoutes } from './routes/files'
import { router as processingRoutes } from './routes/processing'
import { router as definitionRoutes } from './routes/definitions'
import { router as archivedFilesRoutes } from './routes/archived_files'

// middleware
app.use(cors())
app.use(compression()) // compress static content using gzip
// app.use(logger('dev')) // morgan

app.use(session({
  secret: 'our little secret!',
  resave: true,
  saveUninitialized: true
}))

var initPassport = require('./passport-init')
initPassport(passport)

// preview files
var oneDay = 86400000
app.use('/preview', express.static(path.join(__dirname, '../preview'), { maxAge: oneDay }))

// serve either /app or /dist
fs.access(path.resolve(__dirname, '../dist'), function (err) {
  if (err) {
    // TODO: check build process
    console.log('production version "/dist" not found. run "grunt build". serving the development version "/app" ...')
    app.use('/node_modules', express.static(path.resolve(__dirname, '../../node_modules'), { maxAge: oneDay }))
    app.use('/tmp', express.static(path.resolve(__dirname, '../../server/tmp'), { maxAge: oneDay }))
    app.use(express.static(path.resolve(__dirname, '../../app')))
  } else {
    console.log('production version /dist found. serving ...')
    app.use(express.static(path.resolve(__dirname, '../dist')))
  }
})

app.use(bodyParser.json())
app.use(passport.initialize())
app.use(passport.session())

const environment = process.env.NODE_ENV || 'development'
let db = ''
if (environment === 'development') {
  db = 'mongodb://localhost/markdownstore'
} else if (environment === 'test') {
  db = 'mongodb://localhost/teststore'
}

try {
  mongoose.connect(db, { useMongoClient: true })
} catch (err) {
  mongoose.createConnection(db)
}

// security
app.disable('x-powered-by')

// routes
app.use('/auth', authenticate)
app.use('/api', processingRoutes)

app.use('/api', userRoutes)
app.use('/api', definitionRoutes)
app.use('/api', archivedFilesRoutes)
app.use('/api', fileRoutes)
app.use('/api', require('./routes/active_files'))

if (environment === 'production') {
  app.use(logger('combined'))
  app.set('port', process.env.port)

} else if (environment === 'development') {
  app.use(logger('dev'))
  app.set('port', 3000)

} else if (environment === 'test') {
  app.set('port', 3002)
}

// serve
// export for testing purposes
const server = app.listen(app.get('port'), function () {
  console.log('Server listening on port ' + app.get('port') + '!')
})

export default server
