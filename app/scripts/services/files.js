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
		return $resource("/api/v1/files/:id", null, 
			{
				'update': { method: 'PUT' }
			});
  	});

/* default ::

{ 'get':    {method:'GET'},
  'save':   {method:'POST'},
  'query':  {method:'GET', isArray:true},
  'remove': {method:'DELETE'},
  'delete': {method:'DELETE'} };



Resource.query(function(data) {
    // success handler
}, function(error) {
    // error handler
});

Resource.query({
    'query': 'thequery'
},function(data) {
    // success handler
}, function(error) {
    // error handler
});




  */