'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('LoginCtrl', function ($scope, AuthService, $location) {
    var users = [
        {
            user: "axel",
            password: "axel"
        },{
            user: "matthias",
            password: "matthias"
        },{
            user: "anne",
            password: "mainzed"
        },{
            user: "sarah",
            password: "sarah"
        }

    ];

    // check if already logged in, if yes redirect to files overview
    if (AuthService.isAuthenticated()) {
        $location.path("/files");
    }

    $scope.onLoginSubmit = function() {
        $scope.validating = true;  // used to disable login button while validating
        
        var isValid = false;
        users.forEach(function(item) {
            if (item.user === $scope.username) {

                // check password
                if (item.password === $scope.password) {
                    isValid = true;
                }
            }
        });

        if (isValid) {
            AuthService.setUser($scope.username);
            $location.path("/files");
            $scope.validating = false;
        } else {
            $scope.showError = true;
            $scope.validating = false;
        }
    };

  });
