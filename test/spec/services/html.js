'use strict';

describe('Service: HTMLService', function () {
    var service;

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    beforeEach(inject(function (_HTMLService_) {
        service = _HTMLService_;
    }));

    it('should contain the service', function () {
        expect(service).toBeDefined();
    });

    describe('OLAT functions', function() {

        describe('replaceStoryTags()', function() {

            it('should return same html given simple paragraph', function() {
                var html = "<p>test</p>";
                var result = "<p>test</p>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });

            it('should replace tags with breaks before and after', function() {
                var html =  "<p>story{</p>\n" +
                            "<p>test</p>\n" + 
                            "<p>}story</p>";

                var result =    "<div class=\"story\" id=\"story1\">\n" +
                                "<p>test</p>\n" + 
                                "</div>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });

            it('should replace multiple tags', function() {
                var html =  "<p>story{</p>\n" +
                            "<p>first paragraph</p>\n" + 
                            "<p>}story</p>\n" +
                            "<p>story{</p>\n" +
                            "<p>second paragraph</p>\n" + 
                            "<p>}story</p>";

                var result =    "<div class=\"story\" id=\"story1\">\n" +
                                "<p>first paragraph</p>\n" + 
                                "</div>\n" + 
                                "<div class=\"story\" id=\"story2\">\n" +
                                "<p>second paragraph</p>\n" + 
                                "</div>";
                expect(service.replaceStoryTags(html)).toBe(result);
            });
        }),

        describe('createLinksTable()', function() {
            
            it('given linksArray should return div containing a list of all links', function() {
                
                //var html = "some text before <a href='www.google.de'>Google</a> some text after";
                var linksArray = [{
                    url: "www.google.de",
                    text: "Google"
                }];
                var result =    "<div id=\"links-table\" class=\"links-table\">\n" + 
                                "<h4>Links</h4>\n" + 
                                "<ul>\n" +
                                "<li><a href='www.google.de' target='_blank'>Google</a></li>\n" +
                                "</ul>\n" + 
                                "</div>";

                expect(service.createLinksTable(linksArray)).toBe(result);
            });
        
        });
    });

});
