'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var definitionSchema = new Schema({
    author: String,
    word: String,  // shortcut
    title: String,
    url: String,
    license: String,
    text: String,
    category: { type: String, default: "definition" },  // "definition", "image", "story", "linklist"
    filetype: { type: String, default: "opOlat" },
    updated_at: { type: Date, default: Date.now }
});

var Definition = module.exports = mongoose.model('Definition', definitionSchema);
