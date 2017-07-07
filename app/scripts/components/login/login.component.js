'use strict'

angular.module('meanMarkdownApp').component('msLogin', {
  bindings: {},
  templateUrl: 'scripts/components/login/login.component.html',
  controller: function ($scope, $location, $document, AuthService) {
    var ctrl = this

    ctrl.isValidating = false
    ctrl.username = ''
    ctrl.password = ''
    ctrl.passwordConfirm = ''
    ctrl.errorMsg = ''
    ctrl.showSignup = false

    ctrl.$onInit = function () {
      // TODO: proper protection before rendering component
      if (AuthService.isAuthenticated()) {
        $location.path('/files')
      }
    }

    ctrl.onLogin = function () {
      ctrl.isValidating = true // used to disable login button while validating

      AuthService.login(ctrl.username, ctrl.password, function () {
        $location.path('/files')
        ctrl.isValidating = false
      }, function error () {
        ctrl.errorMsg = 'wrong username or password'
        ctrl.isValidating = false
      })
    }

    ctrl.onSignup = function () {
      ctrl.isvalidating = true

      AuthService.signup(ctrl.username, ctrl.password, function () {
        $location.path('/files')
        ctrl.isValidating = false
      }, function error (res) {
        ctrl.errorMsg = res.message
        ctrl.isValidating = false
      })
    }

    ctrl.onPasswordConfirm = function () {
      ctrl.errorMsg = ctrl.password === ctrl.passwordConfirm ? '' : 'passwords do not match!'
    }

    ctrl.loginButtonIsDisabled = function () {
      return !ctrl.username || !ctrl.password || ctrl.isValidating
    }

    ctrl.submitButtonIsDisabled = function () {
      return ctrl.loginButtonIsDisabled() || ctrl.password !== ctrl.passwordConfirm
    }

    // login/submit on enter
    $(document).keydown(function (e) {
      var code = e.keyCode || e.which
      if (code === 13 && !ctrl.showSignup && !ctrl.loginButtonIsDisabled()) {  // enter
        angular.element('#login-button').triggerHandler('click')
      } else if (code === 13 && ctrl.showSignup && !ctrl.submitButtonIsDisabled()) {
        angular.element('#signup-button').triggerHandler('click')
      }
    })
  }
})
