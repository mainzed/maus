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
        $document, $http, $filter, $window, fileService, AuthService, ngDialog,
        definitionService, filetypeService) {

    if (!AuthService.isAuthenticated()) {
        $location.path("/login");
    }

    $scope.init = function() {

        $scope.currentUser = AuthService.getUser();


        // get file based on id provided in address bar
        fileService.get({ id: $routeParams.id }, function(file) {
            $scope.file = file;

            $scope.file.active = $scope.currentUser.name;

            // lock editor if news
            if ($scope.file.type === "news" && $scope.currentUser.group !== "admin") {
                $scope.editor.setOption("readOnly", true);
            }

            // get defined assets/snippets to determine what tabs to display in enrichments table
            $scope.assets = filetypeService.getAssetsForFiletype(file.type);

            // save active state
            fileService.update({ id: $scope.file._id }, $scope.file, function(newFile) {
                //console.log(newFile);
            });

        });

    };

    $scope.showSuccess = false;
    $scope.showError = false;
    $scope.editMode = false;  // used in definitions dialog

    /**
     * makes editor available to rest of controller
     */
    $scope.onCodeMirrorLoaded = function(_editor){
        $scope.editor = _editor;  // for global settings
    };

    $scope.editorOptions = {
        lineWrapping: true,
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

        // migration steps
        if ($scope.file.type === "OLAT") {
            $scope.file.type = "opOlat";
        } else if ($scope.file.type === "presentation") {
            $scope.file.type = "prMainzed";
        }

        var newFile = {
            author: $scope.file.author,
            markdown: $scope.file.markdown,
            type: $scope.file.type,
            title: $scope.file.title,
            private: $scope.file.private,
            updated_by: $scope.currentUser.name
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
                className: 'smalldialog',
                scope: $scope
            }).then(function(success) {
                // user confirmed to go back to files
                $scope.removeActiveState(function() {
                    console.log("remove state");
                });
                $location.path("/files");
            }, function(error) {
                // user cancelled
            });
        } else {  // no changes, go back without asking
            $scope.removeActiveState(function() {
                console.log("remove state");
            });
            $location.path("/files");
        }
    };

    $scope.addSnippet = function(snippet) {
        // add snippet at cursor position or replace selection
        $scope.editor.replaceSelection(snippet);
        $scope.editor.focus();
    };

    $scope.addDefinition = function(definition) {
        var snippet = "{definition: " + definition.word + "}";
        $scope.addSnippet(snippet);
    };

    $scope.addStory = function(definition) {
        var snippet = "{story: " + definition.word + "}";
        $scope.addSnippet(snippet);
    };

    $scope.addImage = function(definition) {
        var snippet = "{picture: " + definition.word + "}";
        $scope.addSnippet(snippet);
    };

    $scope.addCitation = function(definition) {
        var snippet = "{citation: " + definition.word + "}"; // changes
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

    $scope.onExportClick = function() {

        $scope.filename = $scope.file.title.replace(/\s/g, "_") + ".html";

        ngDialog.open({
            template: "./views/templates/dialog_export.html",
            className: "smalldialog",
            disableAnimation: true,
            scope: $scope
        });

    };

    $scope.onDownloadConfirm = function(filename, addTitle, addContentTable, addImages, addLinks, addDefinitions, isFolder) {

        var config = {
            addTitle: addTitle,
            addContentTable: addContentTable,
            addImagesTable: addImages,
            //addLinksTable: addLinks,
            addDefinitionsTable: addDefinitions
            //isFolder: isFolder
        };
        var html;
        definitionService.query(function(definitions) {



            fileService.query(function(files) {

                var markdown = $scope.processIncludes($scope.file.markdown, files);

                //console.log(markdown);
                $scope.fileCopy = angular.copy($scope.file);
                $scope.fileCopy.markdown = markdown;

                if ($scope.file.type === "opOlat") {
                    // convert markdown to html
                    html = HTMLService.getOlat($scope.fileCopy, definitions, config);
                    html = HTMLService.wrapOlatHTML(html, $scope.file.title, isFolder);
                } else if ($scope.file.type === "opMainzed") {
                    html = HTMLService.getOpMainzed($scope.fileCopy, definitions);
                    //html = HTMLService.wrapOpMainzedHTML(html, $scope.file.title);
                }


                // init download
                var blob = new Blob([html], { type:"data:text/plain;charset=utf-8;" });
                var downloadLink = angular.element('<a></a>');
                downloadLink.attr('href', window.URL.createObjectURL(blob));
                downloadLink.attr('download', filename);
                downloadLink[0].click();

            });







        });
    };

    $scope.onUndoClick = function() {
        $scope.editor.undo();
    };

    $scope.onRedoClick = function() {
        $scope.editor.redo();
    };

    $scope.onPreviewClick = function() {

        //console.log("load preview!");

        fileService.query(function(files) {

            var markdown = $scope.processIncludes($scope.file.markdown, files);
            //console.log(markdown);
            $scope.fileCopy = angular.copy($scope.file);
            $scope.fileCopy.markdown = markdown;

            $scope.processHtml($scope.fileCopy, function(previewPath) {
                // success
                $scope.previewPath = previewPath;
                $scope.openDesktopPreview();
            });

        });

    };

    /**
     * requires file object that includes markdown author etc
     */
    $scope.processHtml = function(file, success) {

        var config = {
            addTitle: true,
            addContentTable: true,
            addImagesTable: true,
            //addLinksTable: true,
            addDefinitionsTable: true
        };

        definitionService.query(function(definitions) {
            var html;
            // convert markdown to html
            if ($scope.file.type === "opOlat") {
                html = HTMLService.getOlat(file, definitions, config);
                html = HTMLService.wrapOlatHTML(html, file.title);  // TODO: wrap html and save on server

            } else if ($scope.file.type === "opMainzed") {
                html = HTMLService.getOpMainzed(file, definitions);

            } else if ($scope.file.type === "prMainzed") {
                html = HTMLService.getPrMainzed(file);
                html = HTMLService.wrapPrMainzedHTML(html, file.title);
            }

            var postData = {
                "type": file.type,
                "html": html,
                "user_id": $scope.currentUser._id
            };

            $http.post('/api/savepreview', postData).then(function(data) {

                //$scope.previewPath = data.data;  // returns path of newly created html
                success(data.data.previewPath);

            }, function() {
                // error
                console.log("something went wrong while trying to create preview");
            });
        });
    }

    $scope.openDesktopPreview = function() {
        ngDialog.open({
            template: "./views/templates/dialog_preview.html",
            disableAnimation: true,
            closeByDocument: true,  // enable clicking on background to close dialog
            //className: 'ngdialog-theme-default',
            //className: $scope.dialogClass,
            scope: $scope
        });
    };

    $scope.openMobilePreview = function() {
        ngDialog.open({
            template: "./views/templates/dialog_preview.html",
            disableAnimation: true,
            closeByDocument: true,  // enable clicking on background to close dialog
            className:'ngdialog-theme-default preview-mobile',
            scope: $scope
        });
    };

    $scope.onMobileClick = function() {
        ngDialog.open({
            template: "./views/templates/dialog_preview.html",
            disableAnimation: true,
            closeByDocument: true,  // enable clicking on background to close dialog
            className: 'ngdialog-theme-default mobile-view',
            scope: $scope
        });
    };

    /**
     * update markdown service when editor changes
     */
    $scope.onEditorChange = function() {
        //$scope.file.markdown = $scope.editor.getValue();  // TODO: set file.markdown as ng-model
        $scope.unsavedChanges = true;  // gets reset on save
    };

    // handler for click on button "Glossareintrag"
    $scope.onDefinitionClick = function() {
        ngDialog.open({
            template: "./views/templates/dialog_definitions.html",
            scope: $scope,
            disableAnimation: true,
            preCloseCallback: function() {
                $scope.onApplyDefinitionChanges();
                $scope.editMode = false;
            }
        });
    };

    $scope.getDefinitions = function() {
        $scope.definitions = definitionService.query();
    };

    $scope.onRemoveDefinitionClick = function(id) {
        definitionService.remove({id: id}, function() {
            // success
            // remove from local definitions array without reloading
            var index = _.findIndex($scope.definitions, {_id: id});
            $scope.definitions.splice(index, 1);
        });
    };

    /**
     * saves all defintions in case they were changed
     */
    $scope.onApplyDefinitionChanges = function() {
        //$scope.hasChanges = false;

        $scope.definitions.forEach(function(definition) {


            //definition.filetype = $scope.file.type;  // workaround, append filetype everytime
            if (definition._id) {
                //console.log(definition);
                if (definition.category === "picture") {
                    console.log(definition);
                }
                definitionService.update({id: definition._id}, definition);

            } else {  // new definition
                definitionService.save(definition);
            }
        });
    };

    $scope.onCreateDefinitionClick = function(category) {
        // add empty object to local definitions array
        var timestmap = $filter('date')(new Date(), "yyyy-MM-ddTHH:mm:ss.sssZ", "CEST");

        $scope.definitions.push({
            filetype: $scope.file.type,  // to be shown in table
            category: category,
            updated_at: timestmap // to be sorted to top
        });
    };

    $scope.processIncludes = function(markdown, files) {

        var includes = markdown.match(/include\((.*)\)/g);

        if (includes) {
            for (var i = 0; i < includes.length; i++) {
                //var include = includes[i];
                var filename = includes[i].match(/include\((.*)\)/m)[1];

                // look for file
                for (var j = 0; j < files.length; j++) {
                    var file = files[j];
                    //console.log(files);
                    if (file.title.toLowerCase().trim() === filename.toLowerCase().trim()) {
                        //console.log("inside");
                        if (file.markdown) {
                            //console.log(includes[i]);
                            markdown = markdown.replace(includes[i], file.markdown);
                            break;
                        }
                    }
                }
            }
        }
        return markdown;
    };

    $scope.onHelpClick = function() {
        $window.open("https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet", "_blank");
    };

    $scope.isValidToolForType = function(filetype, toolname) {
        //console.log($scope.file.type, toolname);
        return filetypeService.isValidToolForType(filetype, toolname);
    };

    // listen to click on a enrichmenttag
    /*$(document).on('click', 'span.cm-markdown-definition', function(){
        var category = $(this).text().replace("{", "").replace("}", "").split(":")[0];
        $scope.onDefinitionClick();
    });*/

    $scope.removeActiveState = function(success) {
        // remove active state from file
        $scope.file.active = "none";

        // save active state
        fileService.update({ id: $scope.file._id }, $scope.file, function(newFile) {
            success(newFile);
        });
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
        // fitEditorHeight();
    });

    var timer;
    var stoppedElement=document.getElementsByTagName("body")[0];   // store element for faster access

    function mouseStopped(){                                 // the actual function that is called
        //$("#editor-tools").css("opacity", "0.4");
    }

    window.addEventListener("mousemove",function(){
        //$("#editor-tools").css("opacity", "1");
        //clearTimeout(timer);
        //timer=setTimeout(mouseStopped,1400);
    });

    /**
     * prompt when trying to refresh with unsaved changes
     */
    $(window).bind('beforeunload', function(){
        // this.removeActiveState(function() {
        //     //console.log("unload");
        //     if ($scope.unsavedChanges) {
        //         //this.removeActiveState();
        //
        //
        //     }
        // });
        //this.removeActiveState(function() {
        //    console.log("remove active");
        //});
        //console.log("want to close!");
        return 'It seems like you made unsaved changes to your document. Are you sure you want to leave without saving?';

        /*if ($scope.unsavedChanges) {
            console.log("still unsaved!");
        }*/
    });
});
