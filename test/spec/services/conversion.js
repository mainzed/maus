'use strict';

describe('Service: conversion', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var Conversion;
  var conversion;
  beforeEach(inject(function (_Conversion_) {
    Conversion = _Conversion_;
    conversion = new Conversion("opMainzed");
  }));

  it('should do something', function () {
    expect(!!Conversion).toBe(true);
  });

  it('should initiate', function () {
    expect(conversion.filetype).toBeDefined();
    expect(conversion.filetype).toBe("opMainzed");
    expect(conversion.page).toBeDefined();
  });

  it('appendToPage() should append string to page', function () {
    conversion.appendToPage("<p>some content</p>");
    expect(conversion.page.html()).toBe("<p>some content</p>");

  });



});
