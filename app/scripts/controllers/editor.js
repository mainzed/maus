'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function ($scope, $routeParams, $document, fileService, markdownService) {

 	// check if already editing
 	if (markdownService.getMarkdown().length === 0) {  // new
 		//console.log("new!: " + markdownService.getMarkdown().length);
 		$scope.markdown = "This is a **template**.";
 		markdownService.setMarkdown($scope.markdown);
        markdownService.setCurrentFileId(-1);
 	} else {  // already editing
 		//console.log("already editing!: " + markdownService.getMarkdown().length);
 		$scope.markdown = markdownService.getMarkdown();
        
 	}

 	// check if id was provided to prefill with existing markdown
  	var id = $routeParams.id;
	if (id !== undefined) {  // new file
		// existing file
		//console.log("getting file with ID: " + id);
		fileService.get({id: id}, function(file) {
			markdownService.setMarkdown(file.markdown);
            markdownService.setCurrentFileId(file._id);
			$scope.markdown = markdownService.getMarkdown();
            $scope.file = file; // TODO: use $scope.file.markdown instead of $scope.markdown
		});
	}
	
    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: false,
        mode: 'markdown',
        showTrailingSpace: false,
        showMarkdownLineBreaks: true  // custom
    };

    // bind editor to var to access it's methods later
    //var editor = angular.element('#codeMirrorEditor');


    // direct access to codemirror
    $scope.codemirrorLoaded = function(_editor) {
        console.log("loaded!");
        // Editor part
        /*var _doc = _editor.getDoc();
        _editor.focus();
        */
        // Options
        /*_editor.setOption('firstLineNumber', 10);
        _doc.markClean()*/

        // Events
        //_editor.on("beforeChange", function(){ ... });
        //_editor.on("change", function(){ ... });
    };

    // listeners

    $scope.onSaveClick = function() {
        
        var id = markdownService.getCurrentFileId();
        var markdown = markdownService.getMarkdown();

        if (id === -1) {  // new file
            console.log("saving as new file!");

            var file = {
                author: "John Doe",
                markdown: markdown,
                title: $scope.file.title
            };
            console.log(file);
            // save as new file and set current id
            fileService.save(file, function(file) {
                markdownService.setCurrentFileId(file._id);
            });
        } else {  // existing file
            console.log("updating existing!");
            $scope.file.markdown = markdownService.getMarkdown();
            console.log($scope.file);
            fileService.update({ id: id }, $scope.file);
        }

    };

    $scope.onFilesClick = function() {
        window.location.href = "/#/files";
    };

    $scope.onLabelClick = function() {
        $scope.markdown += "\n[I'm a Label](http://labeling.i3mainz.hs-mainz.de/label/#ec25d32d-3c1a-4539-9755-9bc63c17d989)";
        markdownService.setMarkdown($scope.markdown);
    };

    $scope.onLinkClick = function() {
        $scope.markdown += "\n[I'm a link](https://www.google.com)\n";
        markdownService.setMarkdown($scope.markdown);
    };

    $scope.onImageClick = function() {
        $scope.markdown += "\n![I'm an image](http://placehold.it/350x150)\n*I'm the optional image caption!*\n\n";
        markdownService.setMarkdown($scope.markdown);
    };

    $scope.onStoryScriptClick = function() {
        $scope.markdown += "\n*Place storyscript inside asterisks*\n";
        markdownService.setMarkdown($scope.markdown);
    };

    $scope.onTooltipLinkClick = function() {
        console.log("show toolip!");
        $scope.markdown += "\n[I'm a definition](https://en.wikipedia.org/wiki/Koala \"This is the tooltip text!\")";
        markdownService.setMarkdown($scope.markdown);
    };

    $scope.onUndoClick = function() {
        var what = angular.element('.CodeMirror');
        //var what = uiConfig.codemirror;

        console.log($uiCodemirror);
        what.undo();

        //var codeMirrorInstance = angular.element('#idCodemirror').CodeMirror;
    };

    $scope.onOlatClick = function() {
        if (markdownService.getMarkdown().length > 0) {
            var html = marked(markdownService.getMarkdown());
            if (html !== undefined) {

                // attach body to html
                var content =   "<html>\n" +
                                "  <head>\n" +
                                "  </head>\n"+
                                "  <body>\n" +
                                html + 
                                "  </body>\n"+
                                "</html>\n";

                var anchor = document.querySelector('#exportOlat');
                anchor.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
                // trigger download
                anchor.download = 'export.html';
            }

        } else {
            console.log("no markdown available! start editing something or choose existing file");
        }

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
    	markdownService.setMarkdown($scope.markdown);
    };

    // enabling submenus
    $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
        console.log("does somethnig!");
        // Avoid following the href location when clicking
        event.preventDefault(); 
        // Avoid having the menu to close when clicking
        event.stopPropagation(); 
        // Re-add .open to parent sub-menu item
        $(this).parent().addClass('open');
        $(this).parent().find("ul").parent().find("li.dropdown").addClass('open');
    });

  });
