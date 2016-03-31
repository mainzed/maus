'use strict';

describe('Controller: EdititorCtrl', function () {

  // load the controller's module
  beforeEach(module('meanMarkdownApp'));

  var EdititorCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EdititorCtrl = $controller('EdititorCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(EdititorCtrl.awesomeThings.length).toBe(3);
  });
});
