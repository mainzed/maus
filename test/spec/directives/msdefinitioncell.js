'use strict';

describe('Directive: msDefinitionCell', function () {

  // load the directive's module
  beforeEach(module('meanMarkdownApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ms-definition-cell></ms-definition-cell>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the msDefinitionCell directive');
  }));
});
