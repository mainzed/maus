'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('MainCtrl', function ($scope, $location, $routeParams, fileService, temporaryService, ngDialog) {
  	
    
    $scope.awesomeThings = [1, 2, 3];
    $scope.test = "hello!";

    //$scope.filesActive = false;

    $scope.files = fileService.query();
    $scope.newFile = {};  // filled by dialog

    /*$scope.getFile = function(id) {
        var id = $routeParams.id;
        fileService.get({id: id}, function(file) {
            $scope.file = file;
        });
    };*/

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
        fileService.remove({id: id}, function() {
            // success
            console.log("file remove successfull!");
            $scope.files = fileService.query();
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
                scope: $scope
            });
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

    $scope.markdownToOlatHtml = function(markdown) {
        //var customRenderer = new marked.Renderer();

        // custom heading renderer
        /*var counter = 0;
        customRenderer.heading = function (text, level) {
            var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
            counter++;

            return '<h' + level + ' id="h' + level + '-'+ counter + '">' + text + '</h' + level + '>';
        };*/

        // create OLAT
        //var markdown = temporaryService.getMarkdown();

        //var html = marked(markdown, { renderer: customRenderer });
        var html = marked(markdown);

        html = $scope.replaceStoryTags(html);

        //$scope.html = html;

        // appends tables after last definition was changed
        //replaceDefinitionTags($scope.html);
        
        //appendLinkTable($scope.html);

        return html;
    };

    // replaces opening and closing $ tags with a wrapping div
    // for slides -> use counter to keep track of slide-ids
    $scope.replaceStoryTags = function(html) {
        //var reg = new RegExp(/§\{([\s\S]*?)\}/, "g");
        //var stories = markdown.match(reg);  // store them for later

        return html.replace(/<p>story{/g, '<div class="story">').replace(/}story<\/p>/g, "</div>");
        //html = html.replace(/\n§{/g, '<div class="story">');
    };

    $scope.getLinks = function(html) {
        var container = document.createElement("p");
        container.innerHTML = html;

        var anchors = container.getElementsByTagName("a");
        var list = [];

        for (var i = 0; i < anchors.length; i++) {
            var href = anchors[i].href;
            var title = anchors[i].title;
            var text = anchors[i].textContent;

            if (text === undefined) text = anchors[i].innerText;

            list.push(['<a href="' + href + '">' + text + '</a>', href, text, title]);
        }
        return list;
    };

  });


