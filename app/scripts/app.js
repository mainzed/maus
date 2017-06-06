'use strict'

/**
 * @ngdoc overview
 * @name meanMarkdownApp
 * @description
 * # meanMarkdownApp
 *
 * Main module of the application.
 */
angular
.module('meanMarkdownApp', [
  // 'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  // 'ngTouch',
  'ui.codemirror',
  'ngDialog',
  // 'ngCssInjector',
  // 'sun.scrollable',
  'angular.filter'
])
.config(function ($routeProvider, $locationProvider) {
  // configure routes
  $routeProvider
    .when('/', {
      redirectTo: '/login'
    })
    .when('/login', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/files', {
      templateUrl: 'views/files.html',
      controller: 'MainCtrl'
    })
    .when('/editor/:id', {
      templateUrl: 'views/editor.html',
      controller: 'EditorCtrl'
    })
    .otherwise({
      redirectTo: '/'
    })

  // use # isntead of the newer #!
  $locationProvider.hashPrefix('')
})
