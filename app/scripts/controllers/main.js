'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('MainCtrl', function ($scope, $location, $routeParams, fileService, archivedFileService, ngDialog, AuthService) {
  	
    // check if already logged in, if not, redirect to login page
    

    $scope.init = function() {
        if (!AuthService.isAuthenticated()) {
            $location.path("/login");
        } else {
            $scope.currentUser = AuthService.getUser();
        }
    };

    $scope.files = fileService.query();
    
    $scope.newFile = {};  // filled by dialog

    $scope.onCreateNewFile = function() {
        ngDialog.open({ 
            template: "./views/templates/dialog_new_file.html",
            className: "smalldialog",
            disableAnimation: true,
            closeByDocument: true,  // enable clicking on background to close dialog
            scope: $scope
        });
    };

    // within dialog, click on create
    $scope.onCreateConfirm = function() {

        // save as new file
        var file = {
            author: $scope.currentUser.name,
            title: $scope.newFile.title,
            type: $scope.newFile.type,
            markdown: "This is **markdown**.",
            private: $scope.newFile.private
        };

        fileService.save(file, function(file) {

            $location.path("/editor/" + file._id);

        }, function() {
            // error
            console.log("could not create new file!");
        });
    };

    $scope.onRemoveClick = function(id) {
        
        ngDialog.openConfirm({
            template: "./views/templates/dialog_confirm_delete.html",
            className: "smalldialog",
            disableAnimation: true,
            scope: $scope
        }).then(function (success) {

            fileService.remove({id: id}, function() {
                console.log("file remove successfull!");

                // remove file from local array without reloading
                var index = _.findIndex($scope.files, {_id: id});
                $scope.files.splice(index, 1); 
                //$scope.files = fileService.query();

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
                className: "smalldialog",
                disableAnimation: true,
                scope: $scope
            });
        });
    };

    $scope.onHistoryClick = function(id) {
        fileService.get({id: id}, function(file) {
            $scope.file = file;
            
            ngDialog.open({
                template: "./views/history.html",
                disableAnimation: true,
                scope: $scope
            });
        });
    };

    $scope.getArchivedFiles = function() {
        var id = $routeParams.id;
        $scope.archivedFiles = archivedFileService.query({id: id});
    };

    $scope.hasArchived = [];
    $scope.checkIfArchivedFiles = function(id) {
        // get archived files for a specific fileID
        archivedFileService.query({id: id}, function(files) {
            if (files.length > 0) {  // archived Versions exist for this fileID
                $scope.hasArchived.push(id);
            }
        });
    };

    $scope.onOpenAsNewFileClick = function(archivedFile) {

        // save archivedFile as a new file and open editor
        // save as new file
        var file = {
            author: $scope.currentUser.name,
            title: archivedFile.title + " (restored by " + $scope.currentUser.name + ")",
            type: archivedFile.type,
            private: archivedFile.private,
            markdown: archivedFile.markdown,
            updated_by: $scope.currentUser.name
        };

        // change legacy filetypes
        if (file.type === "OLAT") {
            file.type = "opOlat";
        } else if (file.type === "presentation") {
            file.type = "prMainzed";
        }

        fileService.save(file, function(file) {

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
            private: archivedFile.private,
            markdown: archivedFile.markdown
        };

        // updated file with content from archived File. use fileID to
        // know which file to replace
        fileService.update({id: archivedFile.fileID}, file, function() {
            //console.log("file updated successfully!");
            $scope.files = fileService.query();
            $location.path("/files");
        }, function() {
            console.log("could not update file!");
        });
    };

    $scope.onSaveClick = function(file) {
        fileService.update({id: file._id}, file, function() {
            //success
            //$scope.files = fileService.query();
        }, function() {
            // error
            console.log("could not update file!");
        });
    };

    $scope.onLogoutClick = function() {
        AuthService.logout();
    };

    $("#maus").hover(function(){
       $(this).attr("src", "../images/maussmile.svg");
    });

     $("#maus").mouseleave(function(){
       $(this).attr("src", "../images/maus.svg");
    });

  });


