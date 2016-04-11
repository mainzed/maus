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

  /*it('should attach a list of awesomeThings to the scope', function () {
    expect(DefinitionsCtrl.awesomeThings.length).toBe(3);
  });*/

});
