'use strict';

describe('Directive: msEditorToolbar', function () {

  // load the directive's module
  beforeEach(module('meanMarkdownApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ms-editor-toolbar></ms-editor-toolbar>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the msEditorToolbar directive');
  }));
});
