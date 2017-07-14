'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msTableInput
 * @description
 * # msTableInput
 */
angular.module('meanMarkdownApp')
  .directive('msCitationsTable', function () {
    return {
      templateUrl: 'views/table-citations.html',
      restrict: 'E'
    };
  });
