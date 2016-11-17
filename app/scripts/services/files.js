'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.files
 * @description
 * # files
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('fileService', function($http, $resource, ConfigService) {
		return $resource(ConfigService.API_PATH + "/files/:id", null,
			{
				'update': { method: 'PUT' }
			});
  	});
