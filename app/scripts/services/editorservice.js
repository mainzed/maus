'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.EditorService
 * @description
 * # EditorService
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('EditorService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    
    var editor;
    var doc;

    /**
     * makes editor available to rest of controller 
     */
    this.init = function(_editor) {
        editor = _editor;  // for global settings
        doc = _editor.getDoc();  // access to the editor content
    };

    this.getEditor = function() {
        return editor;
    };

  });
