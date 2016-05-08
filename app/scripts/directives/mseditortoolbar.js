'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msEditorToolbar
 * @description
 * # msEditorToolbar
 */
angular.module('meanMarkdownApp')
  .directive('msEditorToolbar', function () {
    return {
      template: '<div></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        element.text('this is the msEditorToolbar directive');
      }
    };
  });
