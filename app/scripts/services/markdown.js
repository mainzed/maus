'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.markdown
 * @description
 * # markdown
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .factory('temporaryService', function ($cookies) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var service = {};

    var markdown = "";
    var title = "";
    var currentFileId = -1;
    var html = "";


    // check for cookies
    // check for cookies

    /*var cookieId = $cookies.get('temporary');
    console.log(cookieId);
    // Setting a cookie
    $cookies.put('myFavorite', 'oatmeal');

    console.log($cookies.get('myFavorite'));*/

    /** 
     * checks if cookie is set. if yes, assign it's values to 
     * id, title and markdown
     */
    service.getCookies = function() {
        /*var cookie = $cookies.get('current_markdown');
        if (cookie) {
            markdown = cookie;
        }

        cookie = $cookies.get('current_title');
        if (cookie) {
            title = cookie;
        }

        cookie = $cookies.get('current_id');
        if (cookie) {
            currentFileId = cookie;
        }*/
    };
    
    service.setMarkdown = function(newMarkdown) {
    	markdown = newMarkdown;
        //$cookies.put("current_markdown", newMarkdown);
  	};

  	service.getMarkdown = function() {
    	return markdown;
  	};

    service.setTitle = function(newTitle) {
        title = newTitle;
        //$cookies.put("current_title", newTitle);
    };

    service.getTitle = function() {
      return title;
    };

    service.setCurrentFileId = function(id) {
        currentFileId = id;
        //$cookies.put("current_id", id);
    };

    service.getCurrentFileId = function() {
      return currentFileId;
    };

    service.setHtml = function(newHtml) {
      html = newHtml;
    };

    service.getHtml = function() {
      return html;
    };

    return service;
  });
