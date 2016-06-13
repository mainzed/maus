'use strict';

describe('Directive: msCheckboxes', function () {

  // load the directive's module
  beforeEach(module('meanMarkdownApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ms-checkboxes></ms-checkboxes>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the msCheckboxes directive');
  }));
});
