'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msDefinitionTextarea
 * @description
 * # msDefinitionTextarea
 */
angular.module('meanMarkdownApp')
  .directive('focusOnVisibility', function ($timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$watch(attrs.ngShow, function(newValue) {
            if (newValue === true) {
                $timeout(function() {
                  console.log("works");
                  element.focus();
                }, 0, false);
            }
        });
      }
    };
  });
