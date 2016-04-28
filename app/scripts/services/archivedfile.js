'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.archivedFile
 * @description
 * # archivedFile
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('archivedFileService', function ($resource) {
    return $resource("/api/archivedfiles/:id", null, 
        {
            'update': { method: 'PUT' }
        });
  });
