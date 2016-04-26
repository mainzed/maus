'use strict';

describe('Service: temporaryService', function () {

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    var temporaryService;
    beforeEach(inject(function (_temporaryService_) {
        temporaryService = _temporaryService_;
    }));


    it('should be hello', function () {
        expect(true).toBeTruthy();
    });

    it('should do something', function () {
        expect(!!temporaryService).toBe(true);
    });

    /*it('should set markdown', function () {
        var markdown = "This is some **test** markdown!";
        temporaryService.setMarkdown(markdown);
        expect(temporaryService.getMarkdown()).toBe(markdown);
    });

    it('should set title', function () {
        var title = "Test Title";
        temporaryService.setTitle(title);
        expect(temporaryService.getTitle()).toBe(title);
    });

    it('should set id', function () {
        var id = 123;
        temporaryService.setCurrentFileId(id);
        expect(temporaryService.getCurrentFileId()).toBe(id);
    });

    it('should return -1 if no id is set', function () {
        expect(temporaryService.getCurrentFileId()).toBe(-1);
    });*/
});
