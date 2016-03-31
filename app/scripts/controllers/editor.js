'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:EdititorCtrl
 * @description
 * # EdititorCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('EditorCtrl', function ($scope, $routeParams, fileService, markdownService) {

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
    };

    // direct access to codemirror
    $scope.codemirrorLoaded = function(_editor) {
        
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
        console.log(id);
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

    /**
     * update markdown service when editor changes
     */
    $scope.onEditorChange = function() {
    	markdownService.setMarkdown($scope.markdown);
    };

  });
