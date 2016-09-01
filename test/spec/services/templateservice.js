'use strict';

describe('Service: TemplateService', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var TemplateService;
  beforeEach(inject(function (_TemplateService_) {
    TemplateService = _TemplateService_;
  }));

  it('should do something', function () {
    expect(!!TemplateService).toBe(true);
  });

});
