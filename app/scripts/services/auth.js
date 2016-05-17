'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('AuthService', function ($cookieStore, $location) {

    // groups/roles = ["admin", "look-diva", "mainzed"]
    var users = [
        {
            name: "axel",
            password: "axel",
            group: "admin"
        },{
            name: "matthias",
            password: "matthias",
            group: "admin"
        },{
            name: "anne",
            password: "mainzed",
            group: "mainzed"
        },{
            name: "kai",
            password: "mainzed",
            group: "mainzed"
        },{
            name: "sarah",
            password: "sarah",
            group: "look-diva"
        },{
            name: "thomas",
            password: "thomas",
            group: "look-diva"
        },{
            name: "eva",
            password: "eva",
            group: "look-diva"
        }

    ];

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

    /**
     * takes callbacks for success and failure
     */
    this.login = function(username, password, success, failure) {

        // TODO: replace this with actual server login        
        var isValid = false;
        users.forEach(function(item) {
            if (item.name === username) {

                // check password
                if (item.password === password) {
                    isValid = true;

                    $cookieStore.put('currentUser', { 
                        name: item.name,
                        group: item.group 
                    });
                    success();
                }
            }
        });

        if (!isValid) {
            failure();
        }
    };

    this.logout = function() {
        $cookieStore.remove('currentUser');
        $location.path("/login");
    };

  });
