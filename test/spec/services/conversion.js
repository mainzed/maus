'use strict';

describe('Service: conversion', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var conversion;
  beforeEach(inject(function (_conversion_) {
    conversion = _conversion_;
  }));

  it('should do something', function () {
    expect(!!conversion).toBe(true);
  });

});
