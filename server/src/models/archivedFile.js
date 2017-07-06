var mongoose = require('mongoose')
mongoose.Promise = global.Promise

var archivedFileSchema = new mongoose.Schema({
  fileID: String,
  author: String,
  title: String,
  markdown: String,
  type: String,
  updated_by: { type: String, default: 'author' },
  created_at: { type: Date, default: Date.now }
})

var ArchivedFile = module.exports = mongoose.models.ArchivedFile || mongoose.model('ArchivedFile', archivedFileSchema)
