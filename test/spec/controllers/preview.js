'use strict';

describe('Controller: PreviewCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp', ['cssInjector']));
    // load the controller's module
    //beforeEach(module('cssInjector'));

    var PreviewCtrl;
    var scope;
    var cssInjector;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, _cssInjector_) {
        //$location = _$location_;
        scope = $rootScope.$new();
        PreviewCtrl = $controller('PreviewCtrl', {
            $scope: scope
            //cssInjector: _cssInjector_
            // place here mocked dependencies
        });


        //angular.module('MyAppMocks',[]).service('B', ...));
        //angular.module('Test',['MyApp','MyAppMocks']);

    }));




    /*it('should return hello', function () {
        expect(scope.test.toBe("hello"));
    });

    it('should replace story tags in html with divs', function () {
        var html = "some story{ html }story text";
        var expected = "some <div class=\"story\"> html </div> text";
        expect(scope.replaceStoryTags(html)).toBe(expected);
    });*/

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