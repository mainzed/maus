'use strict';

describe("true", function() {
    // load the controller's module
      beforeEach(module('meanMarkdownApp'));

      var MainCtrl,
        scope;

      // Initialize the controller and a mock scope
      beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
          $scope: scope
          // place here mocked dependencies
        });
      }));

      it('should attach a list of awesomeThings to the scope', function () {
        expect(true).toBe(true);
      });

      it('should return works!', function () {
        scope.test1.toBe("works!");
      });

    it("should be true", function() {
        expect(true).toBeTruthy();
    });
});
