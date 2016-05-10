'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var archivedFileSchema = new Schema({
    fileID: String,
    author: String,
    title: String,
    markdown: String,
    type: String,
    updated_by: { type: String, default: "author" },
    created_at: { type: Date, default: Date.now }

});

var ArchivedFile = module.exports = mongoose.model('ArchivedFile', archivedFileSchema);
