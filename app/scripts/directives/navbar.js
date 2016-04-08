'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:navbar
 * @description
 * # navbar
 */
angular.module('meanMarkdownApp')
  .directive('navbar', function ($location) {
    return {
      templateUrl: '/views/templates/navbar.html',
      restrict: 'E',

      // controller
      link: function(scope, element, attrs) {
        
        scope.isActive = function(viewLocation) {
            /*if (viewLocation.indexOf("/editor") > -1) {

            }

                string.indexOf(substring) > -1);


            console.log("viewlocation: " + viewLocation);
            console.log("path: " + $location.path());
            return viewLocation === $location.path();*/
        };
      
      }
    };
  });
