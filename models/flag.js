'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    user: String,
    icon: String,
    color: { type: String, default: getRandomColor() },
    text: String
},{
    timestamps: true  // creates updated_at and created_at
});

var Flag = module.exports = mongoose.model('Flag', schema);

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
