'use strict';

describe('Service: temporaryService', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var temporaryService;
  beforeEach(inject(function (_temporaryService_) {
    temporaryService = _temporaryService_;
  }));

  it('should do something', function () {
    expect(!!temporaryService).toBe(true);
  });

});
