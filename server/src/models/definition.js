import mongoose from 'mongoose'
mongoose.Promise = global.Promise

var definitionSchema = new mongoose.Schema({
  author: String,
  word: String,  // shortcut
  title: String,
  url: String,
  license: String,
  text: String,
  category: { type: String, default: 'definition' },  // "definition", "image", "story", "linklist"
  filetype: { type: String, default: 'opOlat' },
  updated_at: { type: Date, default: Date.now }
})

export default mongoose.models.Definition || mongoose.model('Definition', definitionSchema)
