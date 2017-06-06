"use strict";

var fs = require("fs");
var path = require("path");
var express = require("express");
var app = express();
var port = process.env.PORT || 3000;
var logger = require("morgan");
var passport = require("passport");
var session = require("express-session");
var bodyParser = require("body-parser");
var compression = require("compression");
var cors = require("cors");
var api = require("./routes/api");
var authenticate = require("./routes/authenticate")(passport);

// middleware
app.use(cors());
app.use(compression());  // compress static content using gzip
app.use(logger("dev"));  // morgan
app.use(session({
    secret: "our little secret!",
    resave: true,
    saveUninitialized: true
}));

var initPassport = require("./passport-init");
initPassport(passport);

var oneDay = 86400000;
app.use("/preview",  express.static(__dirname + "/preview", { maxAge: oneDay }));

// serve either /app or /dist
fs.access(path.resolve(__dirname, "../dist"), function(err) {
    if (err) {
        // TODO: check build process
        console.log("production version '/dist' not found. run 'grunt build'. serving the development version '/app' ...");
        app.use('/node_modules',  express.static(path.resolve(__dirname, "../node_modules"), { maxAge: oneDay }));
        app.use(express.static(path.resolve(__dirname, "../app")));
    } else {
        console.log("production version /dist found. serving ...");
        app.use(express.static(path.resolve(__dirname, "../dist")));
    }
});

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

// connect to mongoDB
require("./database.js");

// security
app.disable("x-powered-by");

// routes
app.use("/auth", authenticate);
app.use("/api", api);

// serve
app.listen(port, function () {
    console.log("Server listening on port " + port + "!");
});
