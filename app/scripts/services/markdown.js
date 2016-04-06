'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.markdown
 * @description
 * # markdown
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('temporaryService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {};

    var markdown = "This is a **template**.";
    var title = "";
    var currentFileId = -1;
    
    service.setMarkdown = function(newMarkdown){
    	markdown = newMarkdown;
  	};

  	service.getMarkdown = function(){
    	return markdown;
  	};

    service.setTitle = function(newTitle){
      title = newTitle;
    };

    service.getTitle = function(){
      return title;
    };

    service.setCurrentFileId = function(id){
      currentFileId = id;
    };

    service.getCurrentFileId = function(){
      return currentFileId;
    };

    return service;
  });
