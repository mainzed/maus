'use strict';

describe('Controller: PreviewCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'), [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.codemirror',
        'ngDialog',
        'ngCssInjector'
    ]);

    var PreviewCtrl;
    var scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        
        scope = $rootScope.$new();
        //$location = _$location_;
        //cssInjector = _cssInjector_;
        PreviewCtrl = $controller('PreviewCtrl', {
            $scope: scope
            // place here mocked dependencies
        });

    }));



    it('should replace story tags in html with divs', function () {
        var html = "some story{ html }story text";
        var expected = "some <div class=\"story\"> html </div> text";
        expect(scope.replaceStoryTags(html)).toBe(expected);
    });

    /*it('should replace story tags in html with divs', function () {
        //console.log(PreviewCtrl.test);
        //var controller = createController();

        //console.log($location.path());

        expect(scope.awesomeThings.length).toBe(3);
    });*/

});
/*
var controller = createController();
        $location.path('/about');
        expect($location.path()).toBe('/about');
        expect(scope.isActive('/about')).toBe(true);
        expect(scope.isActive('/contact')).toBe(false);




var scope, $location, createController;

    beforeEach(inject(function ($rootScope, $controller _$location_) {
        $location = _$location_;
        scope = $rootScope.$new();

        createController = function() {
            return $controller('NavCtrl', {
                '$scope': scope
            });
        };
    }));
*/