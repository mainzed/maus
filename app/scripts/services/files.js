'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.files
 * @description
 * # files
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('fileService', function($http, $resource) {
		return $resource("/api/files/:id", null,
			{
				'update': { method: 'PUT' }
			});
  	});
