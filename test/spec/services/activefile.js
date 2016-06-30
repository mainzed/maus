'use strict';

describe('Service: ActiveFileService', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var ActiveFileService;
  beforeEach(inject(function (_ActiveFileService_) {
    ActiveFileService = _ActiveFileService_;
  }));

  it('should do something', function () {
    expect(!!ActiveFileService).toBe(true);
  });

});
