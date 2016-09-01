'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.TemplateService
 * @description
 * # TemplateService
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('TemplateService', function ($http) {

    /**
     * get the basic html structure for the Mainzed Jahresbericht
     */
    this.getOpMainzed = function(success, failure) {
        $http.get("/api/templates/opmainzed").then(function(res) {
            success(res.data);
        }, function(res) {
            failure(res);
        });
    };

    //TODO: get template for opOlat
  });
