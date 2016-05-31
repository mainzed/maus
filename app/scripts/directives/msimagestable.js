'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msTableInput
 * @description
 * # msTableInput
 */
angular.module('meanMarkdownApp')
  .directive('msImagesTable', function () {
    return {
      templateUrl: '../views/templates/images-table.html',
      restrict: 'E'
    };
  });
