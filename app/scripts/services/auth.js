'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('AuthService', function ($cookieStore) {

    //var currentUser;
    
    this.setUser = function(username) {
        //currentUser = username;
        $cookieStore.put('currentUser', username);
    };

    this.getUser = function() {
        return $cookieStore.get('currentUser');
    };

    this.isAuthenticated = function() {
        if ($cookieStore.get('currentUser')) {
            return true;
        } else {
            return false;
        }
    };

    this.login = function() {

    };

    this.logout = function() {
        $cookieStore.remove('currentUser');
    };

  });
