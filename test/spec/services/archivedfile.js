'use strict';

describe('Service: archivedFile', function () {

  // load the service's module
  beforeEach(module('meanMarkdownApp'));

  // instantiate service
  var archivedFile;
  beforeEach(inject(function (_archivedFile_) {
    archivedFile = _archivedFile_;
  }));

  it('should do something', function () {
    expect(!!archivedFile).toBe(true);
  });

});
