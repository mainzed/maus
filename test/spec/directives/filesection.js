'use strict';

describe('Directive: fileSection', function () {

  // load the directive's module
  beforeEach(module('meanMarkdownApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<file-section></file-section>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fileSection directive');
  }));
});
