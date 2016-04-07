'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function ($scope, $routeParams, $document, fileService, temporaryService, ngDialog, definitionService) {

    /**
     * makes editor available to rest of controller 
     */
    $scope.codemirrorLoaded = function(_editor){
        // Editor part
        $scope.editor = _editor;  // for global settings
        $scope.doc = _editor.getDoc();  // access to the editor content
    };

    // set empty file object in case there's no id provided
    /*$scope.file = {
        author: "John Doe",
        markdown: "This is a **template**.",
        title: "This is a title! :)"
    };*/
    // define before get request
    $scope.markdown = temporaryService.getMarkdown();
    $scope.title = temporaryService.getTitle();

 	// get file if id provided
  	var id = $routeParams.id;
	if (id !== undefined) {  // new file
		// existing file
		//console.log("getting file with ID: " + id);
		fileService.get({id: id}, function(file) {
            console.log("loading: " + file.title);

			//markdownService.setMarkdown(file.markdown);
            //markdownService.setCurrentFileId(file._id);
			//$scope.markdown = markdownService.getMarkdown();
            $scope.file = file; // TODO: use $scope.file.markdown instead of $scope.markdown
		    
            // set markdown and title to file
            temporaryService.setMarkdown(file.markdown);
            temporaryService.setTitle(file.title);
            temporaryService.setCurrentFileId(file._id);

            // overwrite default data set earlier, once it has loaded
            $scope.markdown = temporaryService.getMarkdown();
            $scope.title = temporaryService.getTitle();
        });
	} 

    
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: false,
        mode: 'markdown',
        showTrailingSpace: false,
        showMarkdownLineBreaks: true  // custom
    };


    // listeners

    $scope.onSaveClick = function() {
        
        var id = temporaryService.getCurrentFileId();

        if (id === -1) {  // new file
            console.log("saving as new file!");

            var file = {
                author: "John Doe",
                markdown: $scope.markdown,
                title: $scope.title
            };
 
            // save as new file and set current id
            fileService.save(file, function(file) {
                temporaryService.setCurrentFileId(file._id);
            });
        } else {  // existing file
            console.log("updating existing!");
            var newFile = {
                author: "John Doe",
                markdown: $scope.markdown,
                title: $scope.title
            };

            fileService.update({ id: id }, newFile);
        }
    };

    $scope.onFilesClick = function() {
        window.location.href = "/#/files";
    };

    $scope.addSnippet = function(snippet) {
        // add snippet at cursor position or replace selection
        $scope.editor.replaceSelection(snippet);
        $scope.editor.focus();

        // update markdown-service for previews
        var content = $scope.editor.getValue();
        temporaryService.setMarkdown(content);

    };

    $scope.addDefinition = function(definition) {
        var snippet = "{" + definition.word + "}";
        $scope.addSnippet(snippet);
    };

    $scope.onLabelClick = function() {
        var snippet = "[I'm a Label](http://labeling.i3mainz.hs-mainz.de/label/#ec25d32d-3c1a-4539-9755-9bc63c17d989)";
        $scope.addSnippet(snippet);
    };

    $scope.onLinkClick = function() {
        var snippet = "[I'm a link](https://www.google.com)";
        $scope.addSnippet(snippet);
    };

    $scope.onImageClick = function() {
        var snippet = "![I'm an image](http://placehold.it/350x150)\n*I'm the optional image caption!*";
        $scope.addSnippet(snippet);
    };

    $scope.onStoryScriptClick = function() {
        var snippet = "*Place storyscript inside asterisks*";
        $scope.addSnippet(snippet);
    };

    $scope.onTooltipLinkClick = function() {
        ngDialog.open({ 
            template: "./views/templates/definitions_dialog.html",
            scope: $scope
        });
    };
    $scope.getDefinitions = function() {
        $scope.definitions = definitionService.query();
    };

    $scope.onDefinitionsEditClick = function() {
        window.location.href = "#/definitions";
    };

    $scope.onUndoClick = function() {
        $scope.editor.undo();
    };

    $scope.onRedoClick = function() {
        $scope.editor.redo();
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

    /**
     * update markdown service when editor changes
     */
    $scope.onEditorChange = function() {
    	temporaryService.setMarkdown($scope.markdown);
    };

    $scope.onTitleChange = function() {
        temporaryService.setTitle($scope.title);
    };

    // listener shortcuts

    

    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.shiftKey && code === 80) { // Crel + P 

           window.location.href = "/#/preview";
        }
    });


  });
