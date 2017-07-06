var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise
var File = require('../models/file');

var activeFileSchema = new Schema({
    fileID: String,
    users: []
},{
    timestamps: true  // creates updatedAt and createdAt
});

var ActiveFile = module.exports = mongoose.models.ActiveFile || mongoose.model('ActiveFile', activeFileSchema)
