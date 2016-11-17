"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.definition
 * @description
 * # definition
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
  .factory("DefinitionService", function($http, $resource, ConfigService) {
        return $resource(ConfigService.API_PATH + "/definitions/:id", null,
            {
                "update": { method: "PUT" }
            });
    });
