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

    $scope.onDownloadClick = function(id) {
        fileService.get({id: id}, function(file) {
            console.log(file);
            
            // trigger download
            var blob = new Blob([file.markdown], { type:"data:text/plain;charset=utf-8;" });           
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', 'export.md');
            downloadLink[0].click();
     
        });
    };
  });


