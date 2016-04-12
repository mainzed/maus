'use strict';

describe('Controller: MainCtrl', function () {

    // load the controller's module
    beforeEach(module('meanMarkdownApp'));

    var MainCtrl,
    scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        MainCtrl = $controller('MainCtrl', {
            $scope: scope
            // place here mocked dependencies
        });
    }));

    it('should return hello', function () {
        expect(scope.test).toBe("hello!");
    });

    it('should attach a list of awesomeThings to the scope', function () {
        expect(scope.awesomeThings.length).toBe(3);
    });

    describe('HTML conversion', function () {

        it('should convert basic markdown', function () {
            var markdown = "# heading 1\nthis is **markdown**!";
            var html = "<h1 id=\"heading-1\">heading 1</h1>\n<p>this is <strong>markdown</strong>!</p>\n"
            expect(scope.markdownToOlatHtml(markdown)).toBe(html);
        });

        /*it('should replace story tags with blank lines before and after', function () {

            var markdown = "# heading 1\n" + 
                            "this is **markdown**!\n\n" + 
                            "story{\n" + 
                            "some **text**\n" + 
                            "}story\n";
            var html = "<h1 id=\"heading-1\">heading 1</h1>\n" + 
                        "<p>this is <strong>markdown</strong>!</p>\n" + 
                        "<div class=\"story\">\n" + 
                        "some <strong>text</strong>\n" + 
                        "</div>\n";
            expect(scope.markdownToOlatHtml(markdown)).toBe(html);
        });*/

        /*it('should replace story tags without blank lines', function () {

            var markdown = "# heading 1\n" + 
                        "this is **markdown**!\n" + 
                        "story{\n" + 
                        "some **text**\n" + 
                        "}story\n" + 
                        "more normal text";
            var html = "<h1 id=\"heading-1\">heading 1</h1>\n" + 
                    "<p>this is <strong>markdown</strong>!</p>\n" + 
                    "<div class=\"story\">\n" + 
                    "some <strong>text</strong>\n" + 
                    "</div>\n" + 
                    "more normal text";
            expect(scope.markdownToOlatHtml(markdown)).toBe(html);

        });*/

        // replaceStoryTags
        it('should replace story tags', function () {

            var html = "<h1 id=\"heading-1\">heading 1</h1>\n" + 
                            "<p>this is <strong>markdown</strong>!</p>\n" + 
                            "<p>story{\n" + 
                            "some <strong>text</strong>\n" + 
                            "}story</p>\n" + 
                            "<p>more normal text</p>";
            var convertedHtml = "<h1 id=\"heading-1\">heading 1</h1>\n" + 
                                "<p>this is <strong>markdown</strong>!</p>\n" + 
                                "<div class=\"story\">\n" + 
                                "some <strong>text</strong>\n" + 
                                "</div>\n" + 
                                "<p>more normal text</p>";
            expect(scope.replaceStoryTags(html)).toBe(convertedHtml);

        });

        // getLinks
        it('should return list of all links', function () {

            var html = "<a href=\"http://www.some-url.de/\">link-text</a>\n" + 
                        "<a href=\"http://www.some-url2.de/\" title=\"link-title\">link-text2</a>\n" +
                        "<a href=\"http://www.some-url3.de/\">link-text3</a>\n";
            var list = [
                [
                    "<a href=\"http://www.some-url.de/\">link-text</a>",
                    "http://www.some-url.de/",
                    "link-text",
                    ""
                ],
                [
                    "<a href=\"http://www.some-url2.de/\">link-text2</a>",
                    "http://www.some-url2.de/",
                    "link-text2",
                    "link-title"
                ],
                [
                    "<a href=\"http://www.some-url3.de/\">link-text3</a>",
                    "http://www.some-url3.de/",
                    "link-text3",
                    ""
                ]
            ];
            expect(scope.getLinks(html)).toBe(list);

        });

    });



    
});
