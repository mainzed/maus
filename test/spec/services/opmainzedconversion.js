'use strict';

describe('Service: OpMainzedConversion', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var OpMainzedConversion;

  beforeEach(inject(function (_OpMainzedConversion_) {
    OpMainzedConversion = _OpMainzedConversion_;
  }));

  it('should do something', function () {
    expect(!!OpMainzedConversion).toBe(true);
  });

});


var service;
var httpBackend;
var definitionService;

// load the service's module
beforeEach(module('meanMarkdownApp'));

// instantiate service
beforeEach(inject(function (_HTMLService_, _$httpBackend_, _definitionService_) {
    service = _HTMLService_;
    httpBackend = _$httpBackend_;
    definitionService = _definitionService_;
}));
