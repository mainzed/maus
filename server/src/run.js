import mongoose from 'mongoose'
import app from './server'
import morgan from 'morgan'

try {
  mongoose.connect('mongodb://localhost/markdownstore', { useMongoClient: true })
} catch (err) {
  console.log(err)
}

// logger
app.use(morgan('dev'))

// serve
app.listen(3000, () => {
  console.log('Server listening on port ' + 3000 + '!')
})
