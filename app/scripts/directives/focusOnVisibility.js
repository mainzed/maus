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
      link: function postLink(scope, element) {

        scope.$watch("showTextarea", function(newValue) {
            if (newValue === true) {
                $timeout(function() {
                    element.focus();
                }, 0, false);
            }
        });
      }
    };
  });
