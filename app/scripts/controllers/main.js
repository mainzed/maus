'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
.controller('MainCtrl', function (
    $scope,
    $location,
    $routeParams,
    FileService,
    ArchivedFileService,
    ngDialog,
    AuthService,
    ConfigService,
    UserService,
    ActiveFileService
) {
    if (!AuthService.isAuthenticated()) {
        $location.path("/login");
    }

    // check if already logged in, if not, redirect to login page
    $scope.init = function() {
        $scope.currentUser = AuthService.getUser();
        $scope.group = AuthService.getUserGroup();

        $scope.files = FileService.query(function() {
            $scope.appendActiveState();
        });
        $scope.templates = ConfigService.templates;
        $scope.checkforfirefox();
    };

    $scope.canCreate = function(template) {
        return !template.adminOnly || $scope.currentUser.group === "admin";
    };

    $scope.appendActiveState = function() {
        ActiveFileService.query(function(activeFiles) {
            // loop files
            $scope.files.forEach(function(file) {
                var active = _.find(activeFiles, function(o) {
                    return o.fileID === file._id;
                });

                // set active if not already
                if (active) {
                    file.active = active.users;
                } else {
                    // if file not found, remove active state
                    file.active = [];
                }
            });
        });
    };

    $scope.onCreateNewFile = function() {
        $scope.newFile = {};  // filled by dialog
        ngDialog.open({
            template: "views/dialog_new_file.html",
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

        FileService.save(file, function(file) {
            $location.path("/editor/" + file._id);
        }, function() {
            // error
            console.log("could not create new file!");
        });
    };

    $scope.onRemoveClick = function(id) {

        ngDialog.openConfirm({
            template: "views/dialog_confirm_delete.html",
            className: "smalldialog",
            disableAnimation: true,
            scope: $scope
        }).then(function (success) {

            FileService.remove({id: id}, function() {
                // remove file from local array without reloading
                var index = _.findIndex($scope.files, {_id: id});
                $scope.files.splice(index, 1);

                // close open dialogs
                ngDialog.close("ngdialog1");
            });

        }, function () {
            // Error logic here
            console.log("CANCELLED!");
        });
    };

    $scope.onDownloadClick = function(id) {
        FileService.get({id: id}, function(file) {

            // trigger download
            var blob = new Blob([file.markdown], { type:"data:text/plain;charset=utf-8;" });
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', 'export.md');
            downloadLink[0].click();
        });
    };

    $scope.onEditClick = function(id) {
        FileService.get({id: id}, function(file) {
            $scope.file = file;

            ngDialog.open({
                template: "views/dialog_edit_file.html",
                className: "smalldialog",
                disableAnimation: true,
                scope: $scope
            });
        });
    };

    $scope.onHistoryClick = function(id) {

        ArchivedFileService.query({id: id}, function(files) {
            $scope.archivedFiles = files;

            ngDialog.open({
                template: "views/dialog_history.html",
                disableAnimation: true,
                scope: $scope
            });
        });
    };

    $scope.hasArchived = [];
    $scope.checkIfArchivedFiles = function(id) {
        // get archived files for a specific fileID
        ArchivedFileService.query({id: id}, function(files) {
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

        FileService.save(file, function(file) {
            // success
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
        FileService.update({id: archivedFile.fileID}, file, function() {
            //console.log("file updated successfully!");
            $scope.files = FileService.query();

        }, function() {
            console.log("could not update file!");
        });
    };

    $scope.onSaveClick = function(file) {

        FileService.update({id: file._id}, file, function(file) {
            $scope.files = FileService.query();
        }, function error() {
            console.log("could not update file!");
        });
    };

    $scope.onLogoutClick = function() {
        AuthService.logout();
    };

    $scope.getUsers = function() {
        UserService.query(function(users) {
            $scope.users = users;
        });
    };

    $scope.onUsersClick = function() {
        ngDialog.open({
            template: "views/dialog_users.html",
            disableAnimation: true,
            scope: $scope
        });
    };

    $scope.onDeleteUserClick = function(id) {
        UserService.remove({id: id}, function() {
            // remove file from local array without reloading
            var index = _.findIndex($scope.users, {_id: id});
            $scope.users.splice(index, 1);

        });
    };

    $scope.onUserChange = function(user) {
        UserService.update({id: user._id}, user, function() {
            console.log("update of user: " + user.username + " successfull");
        })
    };

    $scope.getName = function(filetype) {
        var template = ConfigService.templates.find(function(o) {
            return o.type === filetype;
        })
        return template.name;
    };

    $("#maus").hover(function(){
        $(this).attr("src", "../images/maussmile.svg");
    });

    $("#maus").mouseleave(function(){
        $(this).attr("src", "../images/maus.svg");
    });

    $scope.checkforfirefox = function() {
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            alert("Bitte Chrome benutzen!!");
        }
    };

    // refresh active state every couple seconds
    setInterval(function() {
        if ($location.url() === "/files") {
            $scope.appendActiveState();
        }
    }, 30000);

});
