'use strict';

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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.codemirror',
    'ngDialog',
    'ngCssInjector'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        redirectTo: '/files'
      })

      .when('/files', {
        templateUrl: 'views/files.html',
        controller: 'MainCtrl'
        //controllerAs: 'main'
      })
      .when('/editor/:id', {
          templateUrl: './views/editor.html',
          controller: 'EditorCtrl'
      })
      .when('/editor', {
          templateUrl: './views/editor.html',
          controller: 'EditorCtrl'
      })
      .when('/preview', {
          templateUrl: './views/preview.html',
          controller: 'PreviewCtrl'
      })
      .when('/definitions', {
          templateUrl: './views/definitions.html',
          controller: 'DefinitionsCtrl'
      })
      .when('/definitions/:id', {
          templateUrl: './views/definition_details.html',
          controller: 'DefinitionsCtrl'
      })
      .when('/html', {
          templateUrl: './views/html.html',
          controller: 'PreviewCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
