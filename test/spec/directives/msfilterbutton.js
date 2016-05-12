'use strict';

describe('Directive: msFilterButton', function () {

  // load the directive's module
  beforeEach(module('meanMarkdownApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ms-filter-button></ms-filter-button>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the msFilterButton directive');
  }));
});
