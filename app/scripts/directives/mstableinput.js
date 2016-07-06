'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msTableInput
 * @description
 * # msTableInput
 */
angular.module('meanMarkdownApp')
  .directive('msTableInput', function () {
    return {
      templateUrl: 'views/table-input.html',
      restrict: 'E',
      //scope: true,
      scope: {
        bindModel:'=ngModel'
      },
      link: function postLink(scope, element, attrs) {
        //element.text('this is the msTableInput directive');
        scope.showTextarea = false;
        //console.log(bindModel);
        //scope.model = attrs.model;
        //element.text(attrs.model);

        //console.log("")

      }
    };
  });
