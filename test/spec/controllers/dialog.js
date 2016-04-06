'use strict';

describe('Controller: DialogCtrl', function () {

  // load the controller's module
  beforeEach(module('meanMarkdownApp'));

  var DialogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DialogCtrl = $controller('DialogCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DialogCtrl.awesomeThings.length).toBe(3);
  });
});
