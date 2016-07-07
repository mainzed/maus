'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msTableInput
 * @description
 * # msTableInput
 */
angular.module('meanMarkdownApp')
  .directive('msDefinitionsTable', function () {
    return {
      templateUrl: 'views/table-definitions.html',
      restrict: 'E'
    };
  });
