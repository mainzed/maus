'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'));

    var $controller;

    beforeEach(inject(function (_$controller_) {
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $controller = _$controller_;


        /*MainCtrl = $controller('MainCtrl', {
            $scope: scope
            // place here mocked dependencies
        });*/
    }));

    it('should return hello', function () {
        var $scope = {};
        var controller = $controller('MainCtrl', { $scope: $scope });
        expect("hello!").toBe("hello!");
    });

 
    it('should attach a list of awesomeThings to the scope', function () {
      expect(scope.awesomeThings.length).toBe(3);
    });


    /*it('should attach a list of awesomeThings to the scope', function () {
        expect(scope.awesomeThings.length).toBe(3);
    });*/
    
});


describe('calculator', function () {

  beforeEach(module('calculatorApp'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  describe('sum', function () {
        it('1 + 1 should equal 2', function () {
            var $scope = {};
            var controller = $controller('CalculatorController', { $scope: $scope });
            $scope.x = 1;
            $scope.y = 2;
            $scope.sum();
            expect($scope.z).toBe(3);
        }); 
    });

});
