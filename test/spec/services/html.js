'use strict';

describe('Service: HTMLService', function () {
    var service;
    var httpBackend;

    // load the service's module
    beforeEach(module('meanMarkdownApp'));

    // instantiate service
    beforeEach(inject(function (_HTMLService_, _$httpBackend_) {
        service = _HTMLService_;
        httpBackend = _$httpBackend_;
    }));

    it('should be defined', function () {
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
        });

        describe('createLinksTable()', function() {
            
            it('given linksArray should return div containing a list of all links', function() {
                
                //var html = "some text before <a href='www.google.de'>Google</a> some text after";
                var linksArray = [
                    {
                        url: "www.google.de",
                        text: "Google"
                    }, {
                        url: "www.google2.de",
                        text: "Google2"
                    }
                ];
                var result =    "<div id=\"links-table\" class=\"links-table\">\n" + 
                                "<h4>Links</h4>\n" + 
                                "<ul>\n" +
                                "<li><a href=\"www.google.de\" target=\"_blank\">Google</a></li>\n" +
                                "<li><a href=\"www.google2.de\" target=\"_blank\">Google2</a></li>\n" +
                                "</ul>\n" + 
                                "</div>";

                expect(service.createLinksTable(linksArray)).toEqual(result);
            });
        
        });

        describe('createImagesTable()', function() {
            
            it('given imagesArray should return div containing a list of all images', function() {
                var imagesArray = [
                    {
                        url: "www.google.de",
                        caption: "This is the caption",
                        author: "John Doe",
                        license: "CC123",
                        title: "Test-Image",
                        preCaption: "Abb.1"
                    }

                ];
                var table =    "<div id=\"images-table\" class=\"images-table\">\n" + 
                                "<h4>Abbildungen</h4>\n" + 
                                "<ul>\n" +
                                "<li>\n" + 
                                "Abb.1<br>\n" +
                                "Test-Image<br>\n" +
                                "John Doe<br>\n" +
                                "CC123<br>\n" +
                                "<a href=\"www.google.de\" target=\"_blank\">Quelle</a>\n" +
                                "</li>\n" + 
                                "</ul>\n" + 
                                "</div>";

                expect(service.createImagesTable(imagesArray)).toEqual(table);
            });

            it('given image without author and license should ommit them', function() {
                var imagesArray = [
                    {
                        url: "www.google.de",
                        caption: "This is the caption",
                        //author: "John Doe",
                        //license: "CC123",
                        title: "Test-Image",
                        preCaption: "Abb.1"
                    }

                ];
                var table =    "<div id=\"images-table\" class=\"images-table\">\n" + 
                                "<h4>Abbildungen</h4>\n" + 
                                "<ul>\n" +
                                "<li>\n" + 
                                "Abb.1<br>\n" +
                                "Test-Image<br>\n" +
                                //"John Doe<br>\n" +
                                //"CC123<br>\n" +
                                "<a href=\"www.google.de\" target=\"_blank\">Quelle</a>\n" +
                                "</li>\n" + 
                                "</ul>\n" + 
                                "</div>";

                expect(service.createImagesTable(imagesArray)).toEqual(table);
            });
        
        });

        describe('replaceDefinitionTags()', function() {


            beforeEach(function () {
                // mock definitions request
                httpBackend.when("GET", "/api/definitions")  // has to be same url that is used in service
                    .respond(200, [{
                                    _id: "571725cd5c6b2bd90ed10b6e",
                                     word: "definition",
                                    __v: 0,
                                    url: "www.google.de",
                                    text: "This is the definition description!",
                                    updated_at: "2016-04-20T06:46:37.887Z",
                                    author: "John Doe"
                            }]);
            });

            afterEach(function() {
                try {
                    httpBackend.flush();
                    httpBackend.verifyNoOutstandingExpectation();
                    httpBackend.verifyNoOutstandingRequest();
                } catch(e) {
                    // statements
                    //console.log(e);
                }
                
            });   

            it('should mock get request', inject(function(definitionService) {
                
                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!
                    expect(definitions.length).toEqual(1);
                    expect(definitions[0].word).toEqual("definition");
                    expect(definitions[0].text).toEqual("This is the definition description!");
                });

            }));


            it('should return input html when no definition in text', inject(function(definitionService) {
                                
                var inputHtml = "<p>This string without a definition!</p>";

                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!
                    var outputHtml = service.replaceDefinitionTags(inputHtml, definitions);

                    expect(definitions[0].word).toEqual("definition");
                    expect(outputHtml).toEqual(inputHtml);
                });
            }));

            it('should replace definition', inject(function(definitionService) {
                                
                var inputHtml = "<p>This string with a {definition}!</p>";
                var expected = "<p>This string with a <a href=\"#definitions-table\" title=\"This is the definition description!\" class=\"definition\">definition</a>!</p>";
                
                definitionService.query(function(definitions) {
                    // gets sync mocked, so no done() needed!
                    var outputHtml = service.replaceDefinitionTags(inputHtml, definitions);

                    expect(definitions[0].word).toEqual("definition");
                    expect(outputHtml).toEqual(expected);
                });
            }));


        });

        /*describe('getOlat()', function() {
            var file;
            var fileWithLinks;
            var fileWithDefinitions;

            beforeEach(function() {

                file = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is **markdown**!"
                };

                fileWithLinks = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is **markdown**!\n\n" +
                                "[Google](www.google.de)" 
                };

                fileWithDefinitions = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is {markdown}!\n\n" +
                                "[Google](www.google.de)" 
                };
            });

            it("should return markdown content as html", function(done) {
                 
                var config = {
                    addTitle: false,
                    addContentTable: false,
                    addImagesTable: false,
                    addLinksTable: false
                };

                var expected =  '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toBe(expected);
                        done();  // async
                    });
                }, 5);
                
            });
        
            it("should add title to html", function(done) {

                var config = {
                    addTitle: true,
                    addContentTable: false,
                    addImagesTable: false,
                    addLinksTable: false
                };
               
                var expected =  '<h1 class="page-title" id="page-title">Test File</h1>\n' +
                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 5);
            });

            it("should add table of content to html", function(done) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: false
                };
               
                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' + 
                                '<li><a href="#h1-1">heading 1</a></li>\n' + 
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n';

                setTimeout(function() {
                    service.getOlat(file, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 5);
            });
        
            it("should add table of content with links to html", function(done) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: true
                };
               
                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' + 
                                '<li><a href="#h1-1">heading 1</a></li>\n' +
                                '<li class=\"seperator\"></li>\n' +
                                '<li><a href="#links-table">Links</a></li>\n' + 
                                '</ul>\n' +
                                '</div>\n' +
                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n' + 
                                '<p><a href="www.google.de" target="_blank">Google</a></p>\n' +
                                // links table
                                '<div id="links-table" class="links-table">\n' +
                                '<h4>Links</h4>\n' +
                                '<ul>\n' +
                                '<li><a href="www.google.de" target="_blank">Google</a></li>\n' +
                                '</ul>\n' +
                                '</div>';

                setTimeout(function() {
                    service.getOlat(fileWithLinks, config, function(html) {
                        expect(html).toEqual(expected);
                        done();
                    });
                }, 5);

            });
        
            it("should add table of definitions to html", function(done) {

                var config = {
                    addTitle: false,
                    addContentTable: true,
                    addImagesTable: false,
                    addLinksTable: true
                };
               
                var expected =  '<div id="headings-table" class="headings-table">\n' +
                                '<ul>\n' + 
                                '<li><a href="#h1-1">heading 1</a></li>\n' + 
                                '<li class=\"seperator\"></li>\n' +
                                '<li><a href="#links-table">Links</a></li>\n' + 
                                '</ul>\n' +
                                '</div>\n' +

                                '<h1 id="h1-1">heading 1</h1>\n' + 
                                '<p>This is <strong>markdown</strong>!</p>\n' + 
                                '<p><a href="www.google.de" target="_blank">Google</a></p>\n' +

                                // links table
                                '<div id="links-table" class="links-table">\n' +
                                '<h4>Links</h4>\n' +
                                '<ul>\n' +
                                '<li><a href="www.google.de" target="_blank">Google</a></li>\n' +
                                '</ul>\n' +
                                '</div>';

                setTimeout(function() {
                    service.getOlat(fileWithLinks, config, function(html) {
                        expect(html).toEqual(false);
                        done();
                    });
                }, 5);

            });

        });*/
    });

    describe('MainzedPresentation functions', function() {

        describe('getMainzedPresentation()', function() {
            var file;
            beforeEach(function() {
                file = {
                    title: "Test File",
                    author: "John Doe",
                    type: "opOlat",
                    markdown:   "# heading 1\n" + 
                                "This is markdown!"
                };
            });

            it("should return html", function() {
                var expected =  "<div class=\"slide\" id=\"slide1\">\n" +
                                '<h1 id="h1-1">heading 1</h1>\n' +
                                "<p>This is markdown!</p>\n" +
                                "</div>";

                expect(service.getMainzedPresentation(file)).toEqual(expected);

            });
        });
        
    });

});
