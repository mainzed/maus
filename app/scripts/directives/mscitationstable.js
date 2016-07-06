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
      templateUrl: 'views/citations-table.html',
      restrict: 'E'
    };
  });
