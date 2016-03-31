'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('MainCtrl', function ($scope, fileService, markdownService) {
    console.log("loading MainCtrl...");
  	$scope.files = fileService.query();
    
    // listeners
    
    /**
     * check if an existing file is currently edited, to prevent
     * editor from being filled with template markdown
     */
    /*$scope.onEditorTabClick = function() {
    	console.log("clicked Editor tab!");
    	if (markdownService.getMarkdown().length < 0) {  // new file
    		window.location.href = "#/editor";
    	} else {  // already editing
    		window.location.href = "#/editor";
    	}
    };*/

    /**
     * on click, delete existing markdown and open editor
     */
    $scope.onCreateNewFile = function() {
    	// TODO: make popup will cancel option
    	if (markdownService.getMarkdown().length > 0) {
    		console.log("If you continue, unsaved changes will be lost.");
    	}
    	
    	markdownService.setMarkdown("");
      markdownService.setCurrentFileId(-1);
    	window.location.href = "#/editor";
    };
  });
