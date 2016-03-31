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
    var editor = angular.element('#codeMirrorEditor');


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
            var file = {
                author: "John Doe",
                markdown: markdown
            };
            // save as new file and set current id
            fileService.save(file, function(file) {
                markdownService.setCurrentFileId(file._id);
            });
        } else {  // existing file
            fileService.update({ id: id }, {
                markdown: markdown
            });
        }

    };

    $scope.onLabelClick = function() {
        $scope.markdown += "\n!label(name, uri)";
    };

    $scope.onImageClick = function() {
        $scope.markdown += "\n![image-alt](https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTZs5OnFksgdOw_wKv72Ep5v1pO32SVV-KZPJEDH7J86V5pfGO8>)\n*Caption this!*\n\n";
    };

    $scope.onUndoClick = function() {
        var what = angular.element('.CodeMirror');
        //var what = uiConfig.codemirror;

        console.log($uiCodemirror);
        what.undo();

        //var codeMirrorInstance = angular.element('#idCodemirror').CodeMirror;
    };

    /**
     * update markdown service when editor changes
     */
    $scope.onEditorChange = function() {
    	markdownService.setMarkdown($scope.markdown);
    };

  });
