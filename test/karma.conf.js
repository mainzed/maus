// Karma configuration
// Generated on 2016-03-30

module.exports = function(config) {
  'use strict';

  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '../',

    // testing framework to use (jasmine/mocha/qunit/...)
    // as well as any additional frameworks (requirejs/chai/sinon/...)
    frameworks: [
      'jasmine'
    ],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-touch/angular-touch.js',
      'bower_components/marked/lib/marked.js',
      'bower_components/codemirror/lib/codemirror.js',
      'bower_components/codemirror/mode/markdown/markdown.js',
      'bower_components/angular-ui-codemirror/ui-codemirror.js',
      'bower_components/bootstrap/dist/js/bootstrap.js',
      'bower_components/ng-dialog/js/ngDialog.js',
      'bower_components/ngcssinjector/dist/ngcssinjector.min.js',
      'bower_components/angular-css/angular-css.js',
      'bower_components/nanoscroller/bin/javascripts/jquery.nanoscroller.js',
      'bower_components/angular-nanoscroller/scrollable.js',
      'bower_components/jquery.mousestop/jquery.event.mousestop.js',
      'bower_components/angular-filter/dist/angular-filter.js',
      'bower_components/lodash/lodash.js',
      'bower_components/col-resizable/colResizable-1.6.js',
      'bower_components/angular-mocks/angular-mocks.js',
      // endbower
      'app/scripts/**/*.js',

      //'test/spec/services/html.js',  // replace services with ** later
      'test/spec/services/*.js',
      //'test/spec/controllers/*.js'  // replace services with ** later
    ],

    // define custom reportes (use mocha-like reporter)
    reporters: ['mocha'],

    // reporter options
    mochaReporter: {
      //output: "minimal"
    },

    // list of files / patterns to exclude
    exclude: [
    ],

    // web server port
    port: 8080,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'PhantomJS'
    ],

    // Which plugins to enable
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-mocha-reporter',
      //'karma-junit-reporter',
      //'karma-firefox-launcher',
      'karma-phantomjs-launcher'
    ],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    colors: true,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // Uncomment the following lines if you are using grunt's server to run the tests
    // proxies: {
    //   '/': 'http://localhost:9000/'
    // },
    // URL root prevent conflicts with the site root
    // urlRoot: '_karma_'
  });
};
