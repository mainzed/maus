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
            _id: "user1",
            name: "axel",
            password: "axel",
            group: "admin"
        },{ 
            _id: "user2",
            name: "matthias",
            password: "matthias",
            group: "admin"
        },{ 
            _id: "user3",
            name: "anne",
            password: "mainzed",
            group: "mainzed"
        },{
            _id: "user4",
            name: "kai",
            password: "mainzed",
            group: "mainzed"
        },{
            _id: "user5",
            name: "sarah",
            password: "sarah",
            group: "look-diva"
        },{
            _id: "user6",
            name: "thomas",
            password: "thomas",
            group: "look-diva"
        },{
            _id: "user7",
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
                        group: item.group,
                        _id: item._id 
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
