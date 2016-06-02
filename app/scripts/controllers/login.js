'use strict';

/**
 * @ngdoc function
 * @name meanMarkdownApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the meanMarkdownApp
 */
angular.module('meanMarkdownApp')
  .controller('LoginCtrl', function ($scope, $location, $timeout, AuthService) {

    // check if already logged in, if yes redirect to files overview
    if (AuthService.isAuthenticated()) {
        $location.path("/files");
    }

    $scope.onLoginSubmit = function() {
        $scope.validating = true;  // used to disable login button while validating

        AuthService.login($scope.username, $scope.password, function() {
            // success
            $location.path("/files");
            $scope.validating = false;
        }, function() {
            // failure
            $scope.showError = true;
            $timeout(function () { $scope.showError = false; }, 3000);

            $scope.validating = false;
        });
    };

    $scope.onSignupSubmit = function() {
        //$scope.validating = true;  // used to disable login button while validating

        AuthService.signup($scope.username, $scope.password, function() {
            // success
            console.log("success!");
            //console.log(users);
        }, function() {
            // failure
            console.log("failure!");
        });

        /*AuthService.login($scope.username, $scope.password, function() {
            // success
            $location.path("/files");
            $scope.validating = false;
        }, function() {
            // failure
            $scope.showError = true;
            $timeout(function () { $scope.showError = false; }, 3000);

            $scope.validating = false;
        });*/
    };

    /**
     * simulate a click when button is enabled and enter is pressed
     */
    $(document).keydown(function (e) {
        var code = e.keyCode || e.which;
        if(code === 13) {  // enter
            // attr('disabled') returns 'disabled' or undefined
            if (!$("#login-button").attr('disabled')) {  // skip when button is disabled
                $("#login-button").click()
            }
        }
    });

  });
