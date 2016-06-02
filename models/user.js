'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type : String , unique : true, required : true },
    password: { type : String , required : true },
    group: String
},{
    timestamps: true  // creates updated_at and created_at
});

var User = module.exports = mongoose.model('User', userSchema);
