'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msDefinitionCell
 * @description
 * # msDefinitionCell
 */
angular.module('meanMarkdownApp')
  .directive('focusOnNew', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the msDefinitionCell directive');

        //console.log(attrs.active);


        /*scope.$watch(attrs.ngShow, function(newValue) {

            // check if attribute active === true

            console.log(attrs.active);
            if (newValue === true) {
                $timeout(function() {
                  element.focus();
                }, 0, false);
            }
        });*/


      }
    };
  });
