"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
.service("ConfigService", function() {

    // host adress -> set to "" for production, "http://localhost:3000/" for development
    this.HOST = "http://localhost:3000";

    // convinience variable to get the api route
    this.API_PATH = this.HOST + "/api";

});
