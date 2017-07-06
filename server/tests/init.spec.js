import mongoose from 'mongoose'
import app from '../src/server'
import Definition from '../src/models/definition'

let server = {}

before(done => {
  mongoose.connect('mongodb://localhost/teststore', { useMongoClient: true })
  server = app.listen(3002, () => done())
})

after(done => {
  server.close() // close express server

  // clear database
  Definition.collection.drop()
  done()
})
