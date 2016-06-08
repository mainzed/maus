'use strict';

/**
 * @ngdoc service
 * @name meanMarkdownApp.auth
 * @description
 * # auth
 * Service in the meanMarkdownApp.
 */
angular.module('meanMarkdownApp')
  .service('AuthService', function ($cookieStore, $location, $http, UserService) {

    this.getUser = function() {
        return $cookieStore.get('currentUser');
    };

    this.getUserGroup = function() {
        return $cookieStore.get('currentUser').group;
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

        var data = {
            username: username,
            password: password
        }

        $http.post('/auth/login', data).then(function(res) {
            // success
            if (res.data.user !== null && res.data.state === "success") {

                $cookieStore.put('currentUser', {
                    name: res.data.user.username,
                    group: res.data.user.group,
                    _id: res.data.user._id
                });

                success(res.data.user);
            } else {
                failure("password or username incorrect!");
            }

        }, function(res) {
            // error
            failure("could not connect to server!");
        });

        /*// TODO: replace this with actual server login
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
        }*/
    };

    this.signup = function(username, password, success, failure) {
        //console.log(users);
        UserService.query(function(users) {
            //success(users);

            // check if user already exists
            var exists = _.find(users, function(user) {
                return user.username === username;
            });

            if (exists) {
                failure({ message: "user already exists!"});
            } else {

                var data = {
                    username: username,
                    password: password
                };

                // trying to sign up
                $http.post('/auth/signup', data).then(function(res) {
                    // success
                    //console.log(res);
                    if (res.data.user !== null && res.data.state === "success") {

                        $cookieStore.put('currentUser', {
                            name: res.data.user.username,
                            //group: item.group,
                            _id: res.data.user._id
                        });

                        success(res.data.user);

                    } else {
                        failure({ message: "something went wrong when trying to signup a new user!"});
                    }

                }, function() {
                    failure({ message: "could not complete signup request!"});
                });

            }

        }, function() {
            failure({ message: "could not connect to users db!"});
        });


    };

    this.logout = function() {
        $cookieStore.remove('currentUser');
        $location.path("/login");
    };

  });
