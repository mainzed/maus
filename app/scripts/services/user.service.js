"use strict";

/**
 * @ngdoc service
 * @name meanMarkdownApp.UserService
 * @description
 * Service in the meanMarkdownApp.
 */
angular.module("meanMarkdownApp")
  .factory("UserService", function($http, $resource, ConfigService) {
		return $resource(ConfigService.API_PATH + "/users/:id", null,
			{
				"update": { method: "PUT" }
			});
  	});
