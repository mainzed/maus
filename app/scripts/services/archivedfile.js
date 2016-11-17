'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.archivedFile
 * @description
 * # archivedFile
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('archivedFileService', function ($resource, ConfigService) {
    return $resource(ConfigService.API_PATH + "/archivedfiles/:id", null,
        {
            'update': { method: 'PUT' }
        });
  });
