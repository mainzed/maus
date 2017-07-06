import mongoose from 'mongoose'
mongoose.Promise = global.Promise

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  group: { type: String, default: 'user' }
}, {
  timestamps: true // creates updated_at and created_at
})

// prevents overwrite watching tests
export default mongoose.models.User || mongoose.model('User', userSchema)
