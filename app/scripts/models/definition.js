'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var definitionSchema = new Schema({
    author: { type: String, default: "John Doe" },
    url: String,
    text: String,
    updated_at: { type: Date, default: Date.now }
});

var Definition = module.exports = mongoose.model('Definition', definitionSchema);
