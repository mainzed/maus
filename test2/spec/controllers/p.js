'use strict';

describe('Controller: PCtrl', function () {

  // load the controller's module
  beforeEach(module('meanMarkdownApp'));

  var PCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PCtrl = $controller('PCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(PCtrl.awesomeThings.length).toBe(3);
  });
});
