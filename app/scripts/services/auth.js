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
        }

    ];

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

    /**
     * takes callbacks for success and failure
     */
    this.login = function(username, password, success, failure) {
        var me = this;
        // TODO: replace this with actual server login        
        var isValid = false;
        users.forEach(function(item) {
            if (item.name === username) {

                // check password
                if (item.password === password) {
                    isValid = true;

                    me.setUser({ 
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
    };

  });
