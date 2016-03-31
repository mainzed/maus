'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PreviewCtrl
 * @description
 * # PreviewCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('PreviewCtrl', function ($scope, markdownService) {
    
    if (markdownService.getMarkdown().length > 0) {  // markdown exists
 		$scope.html = marked(markdownService.getMarkdown());
    } else {
    	$scope.html = "<p>Nothing to preview!</p>";
    }
    
  
  });
