'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type : String , unique : true, required : true },
    password: { type : String , required : true },
    group: { type: String, default: "user" }
},{
    timestamps: true  // creates updated_at and created_at
});

var User = module.exports = mongoose.model('User', userSchema);
