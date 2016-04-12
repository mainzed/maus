'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('MainCtrl', function ($scope, $location, fileService, temporaryService, ngDialog) {
  	

    $scope.awesomeThings = [1, 2, 3];

    //$scope.filesActive = false;

    $scope.files = fileService.query();
    $scope.newFile = {};  // filled by dialog

    // listeners
    $scope.onCreateNewFile = function() {
    	/*
        // TODO: make popup will cancel option
        // reset currently edited data
        temporaryService.setMarkdown("This is **markdown**.");
        temporaryService.setTitle("");
    	//window.location.href = "#/editor";  // full page reload
        $location.path('/editor');
        */

        ngDialog.open({ 
            template: "./views/templates/dialog_new_file.html",
            scope: $scope
        });

    };

    // within dialog, click on create
    $scope.onCreateConfirm = function() {
        console.log("create!");

        // save as new file
        var file = {
            author: $scope.newFile.author,
            title: $scope.newFile.title,
            markdown: "This is **markdown**."
        };

        fileService.save(file, function(file) {
            // success
            temporaryService.setCurrentFileId(file._id);
            temporaryService.setTitle(file.author);
            temporaryService.setMarkdown(file.markdown);

            $location.path("/editor/" + file._id);

        }, function() {
            // error
            console.log("could not create new file!");
        });


    };

    $scope.onRemoveClick = function(id) {
        fileService.remove({id: id}, function() {
            // success
            console.log("file remove successfull!");
        });
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


