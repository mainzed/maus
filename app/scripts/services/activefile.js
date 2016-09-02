'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.activefile
 * @description
 * # activefile
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp').factory('ActiveFileService', function ($resource) {
    return $resource("/api/activefiles/:id", null,
        {
            'update': { method: 'PUT' }
        });
});
