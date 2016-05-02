'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('MainCtrl', function ($scope, $location, $routeParams, fileService, temporaryService, archivedFileService, ngDialog) {
  	

    $scope.awesomeThings = [1, 2, 3];

    $scope.test = "hello!";

    //$scope.filesActive = false;

    $scope.files = fileService.query();
    $scope.newFile = {};  // filled by dialog

    $scope.onCreateNewFile = function() {
        ngDialog.open({ 
            template: "./views/templates/dialog_new_file.html",
            disableAnimation: true,
            closeByDocument: true,  // enable clicking on background to close dialog
            scope: $scope
        });
    };

    // within dialog, click on create
    $scope.onCreateConfirm = function() {

        // save as new file
        var file = {
            author: $scope.newFile.author,
            title: $scope.newFile.title,
            type: $scope.newFile.type,
            markdown: "This is **markdown**."
        };

        fileService.save(file, function(file) {

            // success
            temporaryService.setCurrentFileId(file._id);
            temporaryService.setTitle(file.author);
            temporaryService.setMarkdown(file.markdown);
            temporaryService.setType(file.type);

            $location.path("/editor/" + file._id);

        }, function() {
            // error
            console.log("could not create new file!");
        });
    };

    $scope.onRemoveClick = function(id) {
        
        ngDialog.openConfirm({
            template: "./views/templates/dialog_confirm_delete.html",
            disableAnimation: true,
            scope: $scope
        }).then(function (success) {
            console.log("DELETE!");
            fileService.remove({id: id}, function() {
                console.log("file remove successfull!");
                $scope.files = fileService.query();

                // close open dialogs
                //var openDialogs = ngDialog.getOpenDialogs(); 
                //console.log(openDialogs);
                ngDialog.close("ngdialog1");
            });

        }, function (error) {
            // Error logic here
            console.log("CANCELLED!");
        });
   
    };
    
    $scope.onDownloadClick = function(id) {
        fileService.get({id: id}, function(file) {
            
            // trigger download
            var blob = new Blob([file.markdown], { type:"data:text/plain;charset=utf-8;" });           
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', 'export.md');
            downloadLink[0].click();
        });
    };

    $scope.onEditClick = function(id) {
        fileService.get({id: id}, function(file) {
            $scope.file = file;
            
            ngDialog.open({
                template: "./views/templates/dialog_edit_file.html",
                disableAnimation: true,
                scope: $scope
            });
        });
    };


    $scope.getArchivedFiles = function() {
        var id = $routeParams.id;
        $scope.archivedFiles = archivedFileService.query({id: id});
    };

    $scope.hasArchivedFiles = function(file) {

        $scope.archivedFiles = archivedFileService.query({id: id}, function(files) {
            if (files.length > 0) {
                $scope.hasArchivedFiles = true;
            }
        });
    };

    $scope.onOpenAsNewFileClick = function(archivedFile) {
        console.log(archivedFile);

        // save archivedFile as a new file and open editor
        // save as new file
        var file = {
            author: archivedFile.author,
            title: archivedFile.title,
            type: archivedFile.type,
            markdown: archivedFile.markdown
        };

        fileService.save(file, function(file) {

            // success
            temporaryService.setCurrentFileId(file._id);
            temporaryService.setTitle(file.author);
            temporaryService.setMarkdown(file.markdown);
            temporaryService.setType(file.type);

            $location.path("/editor/" + file._id);

        }, function() {
            // error
            console.log("could not create new file!");
        });
    };

    $scope.onRevertFileClick = function(archivedFile) {
        
        var file = {
            author: archivedFile.author,
            title: archivedFile.title,
            type: archivedFile.type,
            markdown: archivedFile.markdown
        };

        // updated file with content from archived File. use fileID to
        // know which file to replace
        fileService.update({id: archivedFile.fileID}, file, function() {
            console.log("file updated successfully!");
            $scope.files = fileService.query();
            $location.path("/files");
        }, function() {
            console.log("could not update file!");
        });
    };

    $scope.onSaveClick = function(file) {
        fileService.update({id: file._id}, file, function() {
            console.log("file updated successfully!");
            $scope.files = fileService.query();
        }, function() {
            console.log("could not update file!");
        });
    };

    $("#maus").hover(function(){
       $(this).attr("src", "../images/maussmile.svg");
    });

     $("#maus").mouseleave(function(){
       $(this).attr("src", "../images/maus.svg");
    });

  });


