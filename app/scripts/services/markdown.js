'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.markdown
 * @description
 * # markdown
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('markdownService', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {};

    var markdown = "";
    var currentFileId;
    
    service.setMarkdown = function(newMarkdown){
    	markdown = newMarkdown;
  	};

  	service.getMarkdown = function(){
    	return markdown;
  	};

    service.setCurrentFileId = function(id){
      currentFileId = id;
    };

    service.getCurrentFileId = function(){
      return currentFileId;
    };

    return service;
  });
