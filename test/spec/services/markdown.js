'use strict';

describe('Service: markdown', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var markdown;
  beforeEach(inject(function (_markdown_) {
    markdown = _markdown_;
  }));

  it('should do something', function () {
    expect(!!markdown).toBe(true);
  });

});
