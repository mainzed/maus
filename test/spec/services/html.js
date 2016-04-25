'use strict';

describe('Service: HTML', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var HTML;
  beforeEach(inject(function (_HTML_) {
    HTML = _HTML_;
  }));

  it('should do something', function () {
    expect(!!HTML).toBe(true);
  });

});
