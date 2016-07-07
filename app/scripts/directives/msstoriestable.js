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
      templateUrl: 'views/table-stories.html',
      restrict: 'E'
    };
  });
