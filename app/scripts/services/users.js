'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.files
 * @description
 * # files
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('UserService', function($http, $resource) {
		return $resource("/api/users/:id", null,
			{
				'update': { method: 'PUT' }
			});
  	});
