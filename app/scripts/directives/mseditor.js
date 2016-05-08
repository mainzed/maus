'use strict';

/**
 * @ngdoc directive
 * @name meanMarkdownApp.directive:msEditor
 * @description
 * # msEditor
 */
angular.module('meanMarkdownApp')
  .directive('msEditor', function () {
    return {
      template: '<div id="codeMirrorEditor" ui-codemirror="{ onLoad : codemirrorLoaded }" ui-codemirror-opts="editorOptions" ng-model="file.markdown" ng-change="onEditorChange()"></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the msEditor directive');
      }
    };
  });
