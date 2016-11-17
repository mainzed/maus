"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.TemplateService
 * @description
 * # TemplateService
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
  .service("TemplateService", function ($http, ConfigService) {

    /**
     * get the basic html structure for the Mainzed Jahresbericht
     */
    this.getOpMainzed = function(success, failure) {
        $http.get(ConfigService.API_PATH + "/templates/opmainzed").then(function(res) {
            success(res.data);
        }, function(res) {
            failure(res);
        });
    };
});
