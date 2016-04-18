'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function ($scope, $location, $timeout, $routeParams, $document, fileService, temporaryService, ngDialog, definitionService) {

    $scope.showSuccess = false;
    $scope.showError = false;

    // fills title, id and markdown if cookie exists
    temporaryService.getCookies();

    /**
     * makes editor available to rest of controller 
     */
    $scope.codemirrorLoaded = function(_editor){
        // Editor part
        $scope.editor = _editor;  // for global settings
        $scope.doc = _editor.getDoc();  // access to the editor content

        // set cursor to end of document and activate it
        //$scope.editor.goDocEnd;
        //$scope.editor.replaceSelection("");  // workaround since goDocEnd doesnt work
        //$scope.editor.focus();

        //fitEditorHeight();
    };

    // define before get request
    $scope.markdown = temporaryService.getMarkdown();
    $scope.title = temporaryService.getTitle();
    $scope.author = temporaryService.getAuthor();

 	// get file if id provided
  	var id = $routeParams.id;
	if (id !== undefined) {  // new file
		// existing file
		//console.log("getting file with ID: " + id);
		fileService.get({id: id}, function(file) {
            //console.log("loading: " + file.title);

			//markdownService.setMarkdown(file.markdown);
            //markdownService.setCurrentFileId(file._id);
			//$scope.markdown = markdownService.getMarkdown();
            $scope.file = file; // TODO: use $scope.file.markdown instead of $scope.markdown
		    
            // set markdown and title to file
            temporaryService.setMarkdown(file.markdown);
            temporaryService.setTitle(file.title);
            temporaryService.setCurrentFileId(file._id);
            temporaryService.setAuthor(file.author);

            // overwrite default data set earlier, once it has loaded
            $scope.markdown = temporaryService.getMarkdown();
            $scope.title = temporaryService.getTitle();
            $scope.author = temporaryService.getAuthor();
        });
	} 

    
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: false,
        mode: 'markdown',  // CurlyBraceWrappedText
        showTrailingSpace: false,
        showMarkdownLineBreaks: true,  // custom
        showOlatMarkdown: true, // custom OLAT
        scrollbarStyle: null
    };

    // listeners

    $scope.onSaveClick = function() {
        //var images = $scope.getImages(marked(temporaryService.getMarkdown()));
        //console.log(images);
        
        var id = temporaryService.getCurrentFileId();

        // isnt needed currently
        if (id === -1) {  // new file
            console.log("saving as new file!");

            var file = {
                author: "John Doe",
                markdown: $scope.markdown,
                title: $scope.title
            };
 
            // save as new file and set current id
            fileService.save(file, function(file) {
                // success
                console.log("success!");
                temporaryService.setCurrentFileId(file._id);
                
                // show success message for 2 seconds
                $scope.showSuccess = true;
                $timeout(function () { $scope.showSuccess = false; }, 3000);

            
            }, function() {
                // error
                // show success message for 2 seconds
                $scope.showError = true;
                $timeout(function () { $scope.showError = false; }, 3000);
            });


        } else {  // existing file
            console.log("updating existing!");



            var newFile = {
                author: $scope.author,
                markdown: $scope.markdown,
                title: $scope.title
            };

            console.log(newFile);
            fileService.update({ id: id }, newFile, function() {
                // success
                $scope.showSuccess = true;
                $timeout(function () { $scope.showSuccess = false; }, 3000);
            }, function() {
                //error
                $scope.showError = true;
                $timeout(function () { $scope.showError = false; }, 3000);
            });
        }
    };

    $scope.onFilesClick = function() {
        

        /*ngDialog.open({ 
            template: "./views/templates/dialog_back_to_files.html",
            scope: $scope
        });*/
        
        /*ngDialog.openConfirm({
            template: "./views/templates/dialog_back_to_files.html",
            scope: $scope
        });*/

        $location.path("/files");

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
        var snippet = "![image-alt](bilder/filname.jpg \"caption, source, author, license\")";
        $scope.addSnippet(snippet);
    };

    $scope.onStoryScriptClick = function() {
        var snippet = "\nstory{\n\nWrite **normal** markdown inside *storyscript* tags\n\n}story\n";
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
        $location.path("/definitions");
    };

    $scope.onUndoClick = function() {
        $scope.editor.undo();
    };

    $scope.onRedoClick = function() {
        $scope.editor.redo();
    };

    $scope.onPreviewClick = function() {
        console.log("trigger preview!");
        $location.path("/preview");
    };
    
    /*$scope.onMarkdownClick = function() {
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
    };*/

    /**
     * update markdown service when editor changes
     */
    $scope.enableSaveButton = false;
    $scope.onEditorChange = function() {
        var markdown = $scope.editor.getValue();
    	temporaryService.setMarkdown(markdown);
        $scope.markdown = markdown;
        $scope.enableSaveButton = true; // enable button when code was changed
    };

    // also enable save button when title was changed
    $scope.$watch('enableSaveButton', function (newValue, oldValue) {
        $scope.enableSaveButton = true;
    });

    $scope.onTitleChange = function() {
        temporaryService.setTitle($scope.title);
    };

    // listener shortcuts

    // preview hotkey
    /*$(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 69) { // Shift + E 
            console.log("Ctrl + E");
            console.log($location.path());
            
            //if ()
            e.preventDefault();  // stop print action
            $scope.onPreviewClick();
        }
    });*/

    // link hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 76) { // Shift + L 
            console.log("Ctrl + L");
            e.preventDefault();  // stop save action
            $scope.onLinkClick();
        }
    });

    // image hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 73) {
            console.log("Ctrl + I");
            e.preventDefault();  // stop save action
            $scope.onImageClick();
        }
    });

    // save hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 83) { // Shift + S 
            console.log("Ctrl + S");
            e.preventDefault();  // stop save action
            $scope.onSaveClick();
        }
    });

    // undo hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 90) {
            console.log("Ctrl + Z");
            e.preventDefault();
            $scope.onUndoClick();
        }
    });

    $(window).resize(function () {
        //fitEditorHeight();
    });

    function fitEditorHeight() {
        var height = window.innerHeight / 100 * 85;  // get 70% of screen height
        $scope.editor.setSize("",  height);  // empty string as workaround
    }

  });
