'use strict';

describe('Service: EditorService', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var EditorService;
  beforeEach(inject(function (_EditorService_) {
    EditorService = _EditorService_;
  }));

  it('should do something', function () {
    expect(!!EditorService).toBe(true);
  });

});
