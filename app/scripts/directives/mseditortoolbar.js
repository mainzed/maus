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
      templateUrl: '../views/templates/editor-toolbar.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the msEditorToolbar directive');
      }
    };
  });
