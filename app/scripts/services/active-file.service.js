"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.activefile
 * @description
 * # activefile
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
.factory("ActiveFileService", function ($resource, ConfigService) {
    return $resource(ConfigService.API_PATH + "/activefiles/:id", null,
        {
            "update": { method: "PUT" }
        });
});
