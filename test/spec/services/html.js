'use strict';

describe('HTMLService Tests', function () {
    var HTMLService;

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    beforeEach(inject(function (_HTMLService_) {
        HTMLService = _HTMLService_;
    }));

    it('should contain HTMLService', function () {
        expect(HTMLService).not.to.equal(null);
    });

});
