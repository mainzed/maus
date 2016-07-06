'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msTableInput
 * @description
 * # msTableInput
 */
angular.module('meanMarkdownApp')
  .directive('msStoriesTable', function () {
    return {
      templateUrl: 'views/stories-table.html',
      restrict: 'E'
    };
  });
