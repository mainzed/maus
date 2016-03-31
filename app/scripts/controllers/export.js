'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:PCtrl
 * @description
 * # PCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('ExportCtrl', function ($scope, markdownService) {
    
    $scope.onOlatClick = function() {
    	if (markdownService.getMarkdown().length > 0) {
    		var html = marked(markdownService.getMarkdown());
    		if (html !== undefined) {
    			var anchor = document.querySelector('#exportOlat');
	        	anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(html);
	        	// trigger download
	        	anchor.download = 'export.html';
    		}

    	} else {
    		console.log("no markdown available! start editing something or choose existing file");
    	}

    };
    
    $scope.onMarkdownClick = function() {
    	if (markdownService.getMarkdown().length > 0) {
    		var markdown = markdownService.getMarkdown();
    		if (markdown !== undefined) {
    			var anchor = document.querySelector('#exportMarkdown');
	        	anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(markdown);
	        	// trigger download
	        	anchor.download = 'export.md';
    		}

    	} else {
    		console.log("no markdown available! start editing something or choose existing file");
    	}
    };

  });
