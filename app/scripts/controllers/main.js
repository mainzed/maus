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
    $scope.onCreateNewFile = function() {
    	// TODO: make popup will cancel option
    	if (markdownService.getMarkdown().length > 0) {
    		console.log("If you continue, unsaved changes will be lost.");
    	}
    	markdownService.setMarkdown("");
        markdownService.setCurrentFileId(-1);
    	window.location.href = "#/editor";
    };

    $scope.onRemoveClick = function(id) {
        fileService.remove({id: id}, function() {
            console.log("file remove successfull!");
        });
        window.location.href = "/";
    };
  });
