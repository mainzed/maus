import mongoose from 'mongoose'
mongoose.Promise = global.Promise

const fileSchema = new mongoose.Schema({
  author: { type: String, default: 'John Doe' },
  title: String,
  markdown: String,
  type: String,
  private: { type: Boolean, default: false },
  updated_by: { type: String, default: 'author' }
}, {
  timestamps: true  // creates updatedAt and createdAt
})

var File = module.exports = mongoose.models.File || mongoose.model('File', fileSchema)

module.exports.getFiles = (callback, limit) => {
  File.find(callback).limit(limit)
}

module.exports.getFileById = (id, callback) => {
  File.findById(id, callback)
}

module.exports.addFile = (file, callback) => {
  File.create(file, callback)
}

module.exports.updateFile = (id, file, callback) => {
  // build an updated player object out of the provided object in parameters
  // could also just use the parameter object directly (var update = player)
  // but this way I can only apply selected attributes and ignore others
  // but: 'ALL ATTRIBUTES IN UPDATE HAVE TO BE ASSIGNED IN THE JSON, IT CANNOT BE UNDEFINED'
  var update = {
    author: file.author,
    title: file.title,
    type: file.type,
    markdown: file.markdown,
    updated_by: file.updated_by,
    private: file.private
  }
  File.findOneAndUpdate({ _id: id }, update, { new: true }, callback)
}

module.exports.deleteFile = (id, callback) => {
  File.remove({ _id: id }, callback)
}
