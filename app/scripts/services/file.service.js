"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.FileService
 * @description
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
  .factory("FileService", function($http, $resource, ConfigService) {
		return $resource(ConfigService.API_PATH + "/files/:id", null,
			{
				"update": { method: "PUT" }
			});
  	});
