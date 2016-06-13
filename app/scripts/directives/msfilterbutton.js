'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msFilterButton
 * @description
 * # msFilterButton
 */
angular.module('meanMarkdownApp')
  .directive('msFilterButton', function () {
    return {
      templateUrl: '../views/templates/filter-button.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the msFilterButton directive');
      }
    };
  });
