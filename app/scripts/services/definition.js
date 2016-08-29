'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.definition
 * @description
 * # definition
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('definitionService', function($http, $resource) {
        return $resource("/api/definitions/:id", null,
            {
                'update': { method: 'PUT' }////
            });
    });
