import compression from 'compression'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import passport from 'passport'
import path from 'path'
import session from 'express-session'
import * as bodyParser from 'body-parser'

import { router as userRoutes } from './routes/users'
import { router as fileRoutes } from './routes/files'
import { router as processingRoutes } from './routes/processing'
import { router as definitionRoutes } from './routes/definitions'
import { router as archivedFilesRoutes } from './routes/archived_files'

// init new express app
var app = express()

// middleware
app.use(cors())
app.use(compression()) // compress static content using gzip
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
    // console.log('production version "/dist" not found. run "grunt build". serving the development version "/app" ...')
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

// security
app.disable('x-powered-by')

// routes
app.use('/auth', require('./routes/authenticate')(passport))
app.use('/api', processingRoutes)

app.use('/api', userRoutes)
app.use('/api', definitionRoutes)
app.use('/api', archivedFilesRoutes)
app.use('/api', fileRoutes)
app.use('/api', require('./routes/active_files'))

export default app
