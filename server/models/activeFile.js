'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var File = require('../models/file');

var activeFileSchema = new Schema({
    fileID: String,
    users: []
},{
    timestamps: true  // creates updatedAt and createdAt
});

var ActiveFile = module.exports = mongoose.model('ActiveFile', activeFileSchema);
