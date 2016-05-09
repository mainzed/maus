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
      //scope: true,
      link: function postLink(scope, element, attrs) {
        //console.log(attrs.ngShow);
        scope.$watch(attrs.ngShow, function(newValue) {
            if (newValue === true) {
                $timeout(function() {
                    element.focus();
                }, 0, false);
            }
        });
      }
    };
  });
