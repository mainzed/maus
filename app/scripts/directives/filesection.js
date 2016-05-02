'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:fileSection
 * @description
 * # fileSection
 */
angular.module('meanMarkdownApp')
  .directive('filesection', function () {
    return {
      templateUrl: '../views/templates/filesection.html',
      restrict: 'E',
      scope: true,  // isolated scope for each instance

      link: function postLink(scope, element, attrs) {
        
        scope.currentFileType = attrs.filetype;
        //element.text('this is the fileSection directive');
      }
    };
  });
