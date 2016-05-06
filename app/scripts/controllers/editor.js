'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function ($scope, $location, $timeout, $routeParams, HTMLService, $document, fileService, AuthService, temporaryService, ngDialog, definitionService) {
    
    if (!AuthService.isAuthenticated()) {
        $location.path("/login");
    }

    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.editMode = false;  // used in definitions dialog



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

        fitEditorHeight();
    };

    // define before get request
    $scope.markdown = temporaryService.getMarkdown();
    $scope.title = temporaryService.getTitle();
    $scope.author = temporaryService.getAuthor();
    $scope.type = temporaryService.getType();

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
            temporaryService.setType(file.type);

            // overwrite default data set earlier, once it has loaded
            $scope.markdown = temporaryService.getMarkdown();
            $scope.title = temporaryService.getTitle();
            $scope.author = temporaryService.getAuthor();
            $scope.type = temporaryService.getType();

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

        // isnt needed currently -> should not be run
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
                
                $scope.unsavedChanges = false;

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
                type: $scope.type,
                title: $scope.title
            };

            fileService.update({ id: id }, newFile, function() {
                // success

                $scope.unsavedChanges = false;
                
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

        if ($scope.unsavedChanges) {
            ngDialog.openConfirm({
                template: "./views/templates/dialog_confirm_home.html",
                scope: $scope
            }).then(function(success) {
                // user confirmed to go back to files
                $location.path("/files");
            }, function(error) {
                // user cancelled
            });
        } else {  // no changes, go back without asking
            $location.path("/files");
        }

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
        var snippet = "![image-alt](bilder/filname.jpg \"caption; author; license; url\")";
        $scope.addSnippet(snippet);
    };

    $scope.onStoryScriptClick = function() {
        var snippet;
        var selection = $scope.editor.getSelection();
        
        if (selection.length) {
            snippet = "\nstory{\n\n" + selection + "\n\n}story\n";
        } else {
            snippet = "\nstory{\n\nWrite **normal** markdown inside *storyscript* tags\n\n}story\n";
        }
        
        $scope.addSnippet(snippet);
    };

    $scope.onDefinitionClick = function() {
        ngDialog.open({ 
            template: "./views/templates/dialog_definitions.html",
            scope: $scope,
            disableAnimation: true,
            preCloseCallback: function() {
                $scope.editMode = false;
            }
        });
    };
    
    $scope.getDefinitions = function() {
        $scope.definitions = definitionService.query();
    };

    $scope.onExportClick = function() {

        $scope.filename = temporaryService.getTitle().replace(/\s/g, "_") + ".html";
        
        ngDialog.open({ 
            template: "./views/templates/dialog_export.html",
            disableAnimation: true,
            scope: $scope
        });

    };

    $scope.onDownloadConfirm = function(filename, addTitle, includeTable) {

        var config = {
            title: addTitle,
            contentTable: includeTable
        };

        HTMLService.getOlat(config, function(html) {
            // success
            //startOlatDownload(filename, html);
            var blob = new Blob([html], { type:"data:text/plain;charset=utf-8;" });           
            var downloadLink = angular.element('<a></a>');
            downloadLink.attr('href', window.URL.createObjectURL(blob));
            downloadLink.attr('download', filename);
            downloadLink[0].click();  
        });
    };

    $scope.onUndoClick = function() {
        $scope.editor.undo();
    };

    $scope.onRedoClick = function() {
        $scope.editor.redo();
    };

    $scope.onPreviewClick = function() {

        HTMLService.getOlat(false, function(html) {
            $scope.html = html;
                            
            // open dialog when html is fully loaded
            ngDialog.open({ 
                template: "./views/templates/dialog_preview.html",
                disableAnimation: true,
                closeByDocument: true,  // enable clicking on background to close dialog
                scope: $scope
            });

        });

        //TODO: hide rpeview button when editor is empty


    };

    $scope.onDefinitionCreateClick = function() {
        $scope.definition = {};  // reset
        $scope.editMode = true;
    };

    $scope.onDefinitionEditClick = function(definition) {
        $scope.definition = definition;
        $scope.editMode = true;
    };

    $scope.onDefinitionSaveClick = function(definition) {
        if (definition._id) {  // already exists, update!
            definitionService.update({id: definition._id}, definition, function() {
                // success
                $scope.getDefinitions();
                $scope.editMode = false;  // changes view
            });
        } else {  // doesnt exist, create new!
            definitionService.save(definition, function() {
                // success
                $scope.getDefinitions();
                $scope.editMode = false;  // changes view
            });
        }
    };
    
    $scope.onRemoveDefinitionClick = function(id) {
        definitionService.remove({id: id}, function() {
            // success
            $scope.getDefinitions();
        });
    };

    /**
     * update markdown service when editor changes
     */
    $scope.onEditorChange = function() {
        var markdown = $scope.editor.getValue();
    	temporaryService.setMarkdown(markdown);
        $scope.markdown = markdown;

        $scope.unsavedChanges = true;  // gets reset on save
    };

    // also enable save button when title was changed
    /*$scope.$watch('enableSaveButton', function (newValue, oldValue) {
        $scope.enableSaveButton = true;
    });*/

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
            $scope.onLinkClick();
            e.preventDefault();  // stop save action
            
        }
    });

    // image hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 73) {
            console.log("Ctrl + I");
            $scope.onImageClick();
            e.preventDefault();  // stop save action
            
        }
    });

    // save hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 83) { // Shift + S 
            console.log("Ctrl + S");
            $scope.onSaveClick();
            e.preventDefault();  // stop save action
            
        }
    });

    // undo hotkey
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        // shiftKey ctrlKey
        if(e.ctrlKey && code === 90) {
            console.log("Ctrl + Z");
            $scope.onUndoClick();
            e.preventDefault();
        }
    });

    $(window).resize(function () {
        fitEditorHeight();
    });

    var timer;
    var stoppedElement=document.getElementsByTagName("body")[0];   // store element for faster access

    function mouseStopped(){                                 // the actual function that is called
        $("#editor-tools").css("opacity", "0.4");
    }

    window.addEventListener("mousemove",function(){
        $("#editor-tools").css("opacity", "1");
        clearTimeout(timer);
        timer=setTimeout(mouseStopped,1400);
    });

    function fitEditorHeight() {
        var height = window.innerHeight - 44 - 60 - 8;  // form: 34 + 10px // tools: 50 + 10px
        //var height = window.innerHeight / 100 * 85;  // get 70% of screen height
        //editor.setSize("",  height);  // empty string as workaround
        
        $(".nano").css("height", height); 
    }

});
