'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function (
        $scope, $location, $timeout, $routeParams, HTMLService, 
        $document, fileService, AuthService, ngDialog, 
        definitionService, EditorService) {
    
    if (!AuthService.isAuthenticated()) {
        $location.path("/login");
    }

    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.editMode = false;  // used in definitions dialog


    /**
     * makes editor available to rest of controller 
     */
    $scope.codemirrorLoaded = function(_editor){
        EditorService.init(_editor);

        $scope.editor = EditorService.getEditor();

        // Editor part
        //$scope.editor = _editor;  // for global settings
        //$scope.doc = _editor.getDoc();  // access to the editor content

        // set cursor to end of document and activate it
        //$scope.editor.goDocEnd;
        //$scope.editor.replaceSelection("");  // workaround since goDocEnd doesnt work
        //$scope.editor.focus();

        //fitEditorHeight();
    };


    // get file based on id provided in address bar
	fileService.get({ id: $routeParams.id }, function(file) {
        $scope.file = file; 
    });


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

        
        var id = $scope.file._id;

        var newFile = {
            author: $scope.file.author,
            markdown: $scope.file.markdown,
            type: $scope.file.type,
            title: $scope.file.title,
            private: $scope.file.private
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

        $scope.filename = $scope.file.title.replace(/\s/g, "_") + ".html";

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

        HTMLService.getOlat($scope.file, config, function(html) {
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

        HTMLService.getOlat($scope.file, false, function(html) {
            $scope.html = html;
                            
            // open dialog when html is fully loaded
            ngDialog.open({ 
                template: "./views/templates/dialog_preview.html",
                disableAnimation: true,
                closeByDocument: true,  // enable clicking on background to close dialog
                scope: $scope
            });
        });
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

        //$scope.file.markdown = $scope.editor.getValue();  // TODO: set file.markdown as ng-model

        $scope.unsavedChanges = true;  // gets reset on save
    };

    /**
     * saves all defintions in case they were changed
     */
    $scope.onApplyDefinitionChanges = function() {
        $scope.hasChanges = false;
        $scope.definitions.forEach(function(definition) {
            definitionService.update({id: definition._id}, definition, function() {
                // success
            });
        });
        // if a new definition was created, save that as well
        if ($scope.newDefinition) {
            definitionService.save($scope.newDefinition, function() {
                // success
                $scope.newDefinition = false;
                $scope.getDefinitions();
                $scope.createNewMode = false;  // reset
            });
        }
    };

    $scope.onCreateDefinitionClick = function() {
        $scope.newDefinition = {};
        $scope.createNewMode = true;
    };

    $scope.onDeleteDefinitionClick = function(id) {
        definitionService.remove({id: id}, function() {
            $scope.getDefinitions();  // refresh
        });
    };

    $scope.onDefinitionChange = function() {
        $scope.hasChanges = true;
    };

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

    /**
     * prompt when trying to refresh with unsaved changes
     */
    $(window).bind('beforeunload', function(){
        if ($scope.unsavedChanges) {
            return 'It seems like you made unsaved changes to your document. Are you sure you want to leave without saving?';
        }
    });
});
