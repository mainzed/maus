'use strict';

var mongoose = require('mongoose');

var db = process.env.MONGOLAB_URI || 'mongodb://localhost/markdownstore';
//var db = "mongodb://admin:root@ds011800.mlab.com:11800/heroku_ll09cx2q";

mongoose.connect(db, function(err) {
    if (err) {
        console.log("couldn't connect to mongodb!");
        console.log(err);
    } else {
        console.log("connected to mongodb successfully!");
    }
});