'use strict';

describe('Controller: DefinitionsCtrl', function () {

  // load the controller's module
  beforeEach(module('meanMarkdownApp'));

  var DefinitionsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DefinitionsCtrl = $controller('DefinitionsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));
  
  console.log(DefinitionsCtrl);

  it('should attach a list of awesomeThings to the scope', function () {
    console.log(DefinitionsCtrl);
    expect(DefinitionsCtrl.awesomeThings.length).toBe(3);
  });

  it('should return false', function () {
    expect(DefinitionsCtrl.test1).toBe(false);
  });

});
