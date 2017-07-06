var mongoose = require('mongoose')
var Schema = mongoose.Schema
mongoose.Promise = global.Promise

var archivedFileSchema = new Schema({
  fileID: String,
  author: String,
  title: String,
  markdown: String,
  type: String,
  updated_by: { type: String, default: "author" },
  created_at: { type: Date, default: Date.now }
})

var ArchivedFile = module.exports = mongoose.models.ArchivedFile || mongoose.model('ArchivedFile', archivedFileSchema)
