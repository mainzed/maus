'use strict';

describe('Service: activefile', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var activefile;
  beforeEach(inject(function (_activefile_) {
    activefile = _activefile_;
  }));

  it('should do something', function () {
    expect(!!activefile).toBe(true);
  });

});
