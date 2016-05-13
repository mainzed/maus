'use strict';

describe('Service: filetypeService', function () {

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    var service;
    beforeEach(inject(function (_filetypeService_) {
        service = _filetypeService_;
    }));

    it('should do something', function () {
        expect(!!service).toBe(true);
    });

    it('should return name for specific filetype', function() {
        expect(service.getNameByType("opOlat")).toEqual("OLAT");
    });


});
